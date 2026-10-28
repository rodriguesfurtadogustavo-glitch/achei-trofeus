"""Prepara o áudio do anúncio.

1. voice.wav  — trechos da voz cortados exatamente nos frames de src/data/edit.json, com
   passa-altas, redução de ruído suave, compressão moderada, nivelamento por take
   (mesma loudness entre os clipes) e fades de 12 ms nas emendas (sem estalos).
2. music.wav  — trilha instrumental ORIGINAL sintetizada aqui (110 BPM, percussão limpa),
   arranjada pelas cenas da montagem. Não há trilha licenciada no material recebido.
3. sfx-*.wav  — efeitos curtos sintetizados: laser, passagem de cartão, toque de montagem,
   lata e acento da chamada.

Uso: python3 -I scripts/prepare_audio.py   (requer ffmpeg e numpy)
Tudo é determinístico (semente fixa).
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio")
os.makedirs(OUT, exist_ok=True)
EDIT = json.load(open(os.path.join(ROOT, "src", "data", "edit.json")))
SR = 48000
FPS = EDIT["fps"]
rng = np.random.default_rng(20261028)


def write_wav(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def ffmpeg_pcm(args):
    raw = subprocess.run(["ffmpeg", "-v", "error", *args, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def lufs(path_or_args):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *path_or_args, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


# ---------------------------------------------------------------- 1. voz
VOICE_TARGET = -19.0  # por take; o master final leva tudo a -16 LUFS integrados
FADE = 0.012
clips = EDIT["clips"]
parts = []
tmp = os.path.join(OUT, "_take.wav")
for i, c in enumerate(clips):
    t0, t1 = c["in"] / FPS, c["out"] / FPS
    dur = t1 - t0
    chain = (f"atrim=start={t0:.6f}:end={t1:.6f},asetpts=PTS-STARTPTS,"
             "highpass=f=80,lowpass=f=15000,afftdn=nr=8:nf=-50:tn=1,"
             "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=120:makeup=1,"
             f"afade=t=in:st=0:d={FADE},afade=t=out:st={dur - FADE:.6f}:d={FADE}")
    x = ffmpeg_pcm(["-i", os.path.join(ROOT, "public", c["file"]), "-af", chain])
    n = round(dur * SR)
    x = np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]
    write_wav("_take.wav", x)
    measured = lufs(["-i", tmp])
    gain = 10 ** ((VOICE_TARGET - measured) / 20)
    print(f"take {i + 1}: {measured:6.1f} LUFS -> ganho {20 * np.log10(gain):+.1f} dB, {n} amostras ({dur:.3f}s)")
    parts.append(x * gain)
os.remove(tmp)
voice = np.concatenate(parts)
voice = np.pad(voice, ((0, round(EDIT["endCardFrames"] / FPS * SR)), (0, 0)))
write_wav("voice.wav", voice)
TOTAL = len(voice) / SR
print(f"voice.wav: {TOTAL:.3f}s")

# ------------------------------------------------------------ 2. música
BPM = 110
BEAT = 60 / BPM
N = int(TOTAL * SR) + SR
t_all = np.arange(N) / SR
music = np.zeros((N, 2))

starts = np.cumsum([0] + [c["out"] - c["in"] for c in clips]) / FPS
S = {f"s{i + 1}": starts[i] for i in range(7)}
S["end"] = starts[7]


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    music[i:i + len(sig), 0] += sig * gain * l * 1.414
    music[i:i + len(sig), 1] += sig * gain * r * 1.414


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y


def kick():
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.6 * np.sin(ph) * np.exp(-t / 0.16)) * 0.9 + rng.standard_normal(n) * env(n, 0.0005, 0.003) * 0.25


def clap():
    n = int(0.3 * SR)
    noise = rng.standard_normal(n)
    bp = noise - onepole_lp(noise, 900)
    bp = onepole_lp(bp, 5200)
    e = np.zeros(n)
    for off in (0, 0.011, 0.022):
        k = int(off * SR); e[k:] += env(n - k, 0.0008, 0.012 if off < 0.02 else 0.09)
    return bp * e * 1.6


def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    noise = rng.standard_normal(n)
    hp = noise - onepole_lp(noise, 7000)
    return hp * env(n, 0.0005, 0.06 if open_ else 0.014)


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


# acordes (Lá menor): Am  F  C  G   — um compasso cada
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
ROOTS = [45, 41, 48, 43]
BAR = 4 * BEAT


def pad(chord, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for m in chord:
        for det in (-0.08, 0.0, 0.08):
            f = note(m + 12) * 2 ** (det / 12)
            # dente de serra suave (poucos harmônicos)
            s += sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 6))
    s = onepole_lp(s / 30, 1400)
    a = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
    return s * np.clip(a, 0, 1)


def bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    f = note(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return np.tanh(1.4 * s) * env(n, 0.004, dur * 0.55) * 0.6


def pluck(m, dur=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    f = note(m + 12)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return s * env(n, 0.002, 0.07)


def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    hp = noise - onepole_lp(noise, 2500)
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 1500 * (t / dur) ** 2) / SR)
    return (hp * 0.25 + sweep * 0.12) * (t / dur) ** 2


def impact():
    n = int(1.6 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.5)
    noise = onepole_lp(rng.standard_normal(n), 3000) * np.exp(-t / 0.25)
    return sub * 0.8 + noise * 0.3


end_t = S["end"]
nbeats = int(np.ceil(TOTAL / BEAT)) + 1
for b in range(nbeats):
    tb = b * BEAT
    if tb >= end_t:
        break
    bar, beat_in_bar = divmod(b, 4)
    ci = bar % 4
    full = tb >= S["s4"]
    build = S["s6"] <= tb < S["s7"]
    peak = tb >= S["s7"]
    # bumbo: 1 e 3 sempre; quatro no chão a partir da demonstração
    if beat_in_bar in (0, 2) or full:
        add(kick(), tb, 0.55 if tb < S["s2"] else (0.7 if not full else 0.8))
    if full and beat_in_bar in (1, 3):
        add(clap(), tb, 0.45 if not peak else 0.55, pan=0.05)
    # chimbal em colcheias, semicolcheias na construção e na chamada
    sub = 4 if (build or peak) else 2
    for s in range(sub):
        add(hat(open_=(s == sub // 2 and beat_in_bar == 3 and sub == 2)), tb + s * BEAT / sub,
            (0.16 if s % 2 else 0.22) * (1.15 if peak else 1), pan=0.3 if s % 2 else -0.2)
    if beat_in_bar == 0:
        add(pad(CHORDS[ci], BAR + 0.25), tb, 0.55 if tb < S["s6"] else 0.7)
    if tb >= S["s3"]:
        for s in range(2):
            add(bass(ROOTS[ci] - (12 if s else 0), BEAT / 2), tb + s * BEAT / 2, 0.45)
    if build or peak:
        arp = CHORDS[ci] + [CHORDS[ci][0] + 12]
        for s in range(4):
            add(pluck(arp[(beat_in_bar * 4 + s) % 4]), tb + s * BEAT / 4, 0.09 if build else 0.12,
                pan=-0.35 + 0.23 * s)

add(riser(1.6), S["s7"] - 1.6, 0.8)
add(impact(), S["s7"], 0.55)
# fecho: impacto e acorde final de Am sustentado
add(impact(), end_t, 0.8)
add(pad(CHORDS[0], TOTAL - end_t + 0.2), end_t, 0.8)
add(bass(ROOTS[0] - 12, 1.8), end_t, 0.5)

music = music[: int(TOTAL * SR)]
fade = int(0.35 * SR)
music[-fade:] *= np.linspace(1, 0, fade)[:, None]
music *= 10 ** (-6 / 20) / np.max(np.abs(music))
write_wav("music.wav", music)
print(f"music.wav: {len(music) / SR:.3f}s  cenas: " + ", ".join(f"{k}={v:.2f}s" for k, v in S.items()))

# ------------------------------------------------------------------ 3. efeitos


def norm(x, db=-3):
    return x * 10 ** (db / 20) / np.max(np.abs(x))


def sfx_laser():
    n = int(0.55 * SR); t = np.arange(n) / SR
    f = 1800 + 3600 * (t / t[-1]) ** 0.7
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    buzz = np.sign(np.sin(2 * np.pi * 115 * t)) * 0.25
    noise = rng.standard_normal(n); sizzle = noise - onepole_lp(noise, 6000)
    e = np.minimum(1, t / 0.01) * np.clip((0.55 - t) / 0.2, 0, 1)
    return norm((tone * 0.35 + buzz * 0.2 * tone + sizzle * 0.35) * e, -6)


def sfx_whoosh():
    n = int(0.5 * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # varredura de filtro: acumula passa-baixas com corte variável
    y = np.empty(n); acc = 0.0
    for k in range(n):
        fc = 300 + 4500 * np.sin(np.pi * t[k] / t[-1]) ** 2
        a = np.exp(-2 * np.pi * fc / SR)
        acc = (1 - a) * noise[k] + a * acc
        y[k] = acc
    return norm(y * np.sin(np.pi * t / t[-1]) ** 1.5, -8)


def sfx_thud():
    n = int(0.7 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.18)
    knock = onepole_lp(rng.standard_normal(n), 1800) * np.exp(-t / 0.012)
    wood = np.sin(2 * np.pi * 420 * t) * np.exp(-t / 0.05) * 0.3
    return norm(body + knock * 1.4 + wood, -4)


def sfx_can():
    n = int(0.6 * SR); t = np.arange(n) / SR
    ping = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in
               ((2150, 1, 0.12), (3480, 0.6, 0.08), (5230, 0.35, 0.05), (7010, 0.2, 0.03)))
    noise = rng.standard_normal(n); fizz = (noise - onepole_lp(noise, 5000)) * np.exp(-t / 0.15) * 0.12
    return norm(ping + fizz, -6)


def sfx_accent():
    n = int(1.1 * SR); t = np.arange(n) / SR
    chord = sum(np.sin(2 * np.pi * note(m) * t) * np.exp(-t / 0.35) for m in (81, 84, 88, 93))
    sub = np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.25)
    return norm(chord * 0.4 + sub * 0.8, -4)


for name, fn in (("laser", sfx_laser), ("whoosh", sfx_whoosh), ("thud", sfx_thud),
                 ("can", sfx_can), ("accent", sfx_accent)):
    write_wav(f"sfx-{name}.wav", fn())
print("efeitos: laser, whoosh, thud, can, accent")
