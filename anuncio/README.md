# Anúncio Achei Arquivos — “O arquivo ganha forma”

Anúncio vertical (1080 × 1920, 30 fps, H.264/AAC 48 kHz) para **acheiarquivos.com.br**, montado em
**Remotion 4 + React + TypeScript**, com o trecho 3D em **Three.js / React Three Fiber via @remotion/three**.

**Entregas** (pasta `out/`):

| Arquivo | Conteúdo |
|---|---|
| `out/achei-arquivos-anuncio.mp4` | Vídeo final masterizado (−16 LUFS, pico ≤ −1 dBTP) |
| `out/achei-arquivos-anuncio.srt` | Legendas completas revisadas (inclui as frases que no vídeo aparecem como título) |

> A composição é renderizada em 1080 × 1920, mas o vídeo da apresentadora vem dos anexos de
> **512 × 910** (ampliados ~2,1×). Os gráficos ficam nítidos em 1080p; o detalhe da gravação continua
> sendo o dos anexos. Se houver originais em resolução maior, basta trocar os arquivos em
> `public/videos/` (mesmos nomes) e conferir `in`/`out` em `src/data/edit.json`.

## Comandos usados

```bash
cd anuncio
npm install

# 1) áudio: voz tratada + trilha original + efeitos   (python3 + numpy + ffmpeg)
python3 -I scripts/prepare_audio.py

# 2) (opcional) refazer contornos/máscaras do troféu  (numpy + opencv-python-headless<5)
python -I scripts/trace_judo.py

# prévia interativa
npx remotion studio

# quadros de inspeção (out/samples/)
node scripts/stills.mjs 30 400 870 1370 1450

# 3) renderização
npx remotion render AcheiArquivos out/_render.mp4

# 4) masterização do áudio (loudnorm em 2 passagens; vídeo copiado)
scripts/master.sh out/_render.mp4 out/achei-arquivos-anuncio.mp4

# 5) legendas
node scripts/make_srt.mjs out/achei-arquivos-anuncio.srt
```

`remotion.config.ts` usa o Chrome headless local se existir (`REMOTION_BROWSER` sobrepõe) e WebGL por
software (`swangle`), então o 3D renderiza sem GPU.

## Estrutura

```
src/
  data/edit.json        ← dados editoriais: cortes (frames), rosto por take, legendas (s de origem)
  data/judoPaths.ts     ← contornos vetoriais das camadas reais do troféu (gerado)
  config.ts             ← marca (cores, fontes), intensidade, marcações das cenas, câmera, efeitos, mixagem
  Composition.tsx       ← ordem das camadas
  components/           ← Presenter (vídeo + reenquadramento), Captions, Title, Laser, FileCard/MorphBox,
                          CatalogCard, VectorDrawing, Trophy3D, SodaCan3D, EndCard, AudioMix
  scenes/Scene1..7.tsx  ← direção de cada cena
public/
  videos/               ← os 7 takes originais (cópia intacta dos anexos)
  catalog/, judo/       ← fotos do catálogo do site Achei Troféus (img/cut, img/judo)
  audio/                ← voice.wav, music.wav, sfx-*.wav (gerados por prepare_audio.py)
  fonts/                ← Bricolage Grotesque e Inter (OFL), empacotadas localmente
scripts/                ← prepare_audio.py, trace_judo.py, stills.mjs, make_srt.mjs, master.sh
```

Tudo é determinado pelo frame (sem `Math.random` nem relógio): o mesmo frame sempre gera a mesma imagem.

## Montagem final (cortes conferidos)

Os tempos do briefing vinham da transcrição automática, que **adianta o início das falas** em 0,2–0,6 s
(ex.: no take 1 o “Ei” começa em 4,13 s, não 3,68 s; o pico em 3,33 s é um estalo, não fala). Os cortes
foram refeitos pela energia do áudio, mantendo ~0,2–0,4 s antes da primeira sílaba e ~0,2 s depois da
última. Quando havia dúvida (som fraco antes da frase), o corte do briefing foi mantido.

| # | Arquivo | Entrada → saída (frames de origem) | Timeline |
|---|---|---|---|
| 1 | IMG_3418 | 112 → 308 | 0,000 → 6,533 s |
| 2 | IMG_3420 | 86 → 336 | 6,533 → 14,867 s |
| 3 | IMG_3421 | 99 → 288 | 14,867 → 21,167 s |
| 4 | IMG_3423 | 106 → 390 | 21,167 → 30,633 s |
| 5 | IMG_3427 | 25 → 138 | 30,633 → 34,400 s |
| 6 | IMG_3431 | 44 → 280 | 34,400 → 42,267 s |
| 7 | IMG_3432 | 82 → 232 | 42,267 → 47,267 s |
| Fecho | cartela | 60 frames | 47,267 → 49,267 s |

**Total: 1.478 frames = 49,27 s.** Voz sempre em 1×; cortes secos consecutivos, sem sobrepor falas;
as transições são formas gráficas por cima dos cortes.

## Áudio

- **Voz**: cortes exatos por amostra, passa-altas 80 Hz, redução de ruído suave (afftdn 8 dB),
  compressão 2,5:1, cada take nivelado a −19 LUFS (diferenças entre takes eram de até 1,7 LU),
  fades de 12 ms nas emendas.
- **Música**: trilha instrumental **original, sintetizada por `prepare_audio.py`** (110 BPM, Lá menor,
  bumbo/palmas/chimbal limpos, pad, baixo; cresce nas cenas 6–7 e resolve na cartela). Não havia
  trilha licenciada no material — trocar `public/audio/music.wav` por uma trilha licenciada mantém o
  ducking automático.
- **Ducking**: a música desce sob a fala, calculado das legendas (`MIX` em `config.ts`).
- **Efeitos**: laser, passagem de cartão, toque de montagem da peça, lata e acento da chamada.
- **Master**: `scripts/master.sh` → −16 LUFS integrados, pico verdadeiro ≤ −1 dBTP.

## Ativos e decisões a conferir

- **Nome da apresentadora**: a transcrição ouviu “Karoline”; o README do site cita o perfil
  `@karuliny.t.r`, então a legenda usa **“Karuliny”**. A identificação visual usa **Karu**.
  Conferir a grafia na escuta antes de veicular (`src/data/edit.json`, legenda “Eu sou …”).
- Correções sobre a transcrição automática: “vem de troféus” → **vende troféus**; “Clique agora e saiba
  mais” → **em Saiba Mais**; “colocar a parte da” → **colocar parte da**.
- **Logo**: não havia logo oficial utilizável; o nome é escrito em Bricolage Grotesque (sem símbolo).
- **Corel**: não havia captura real. A cena 4 usa uma interface vetorial abstrata com o rótulo
  **“Demonstração ilustrativa”**, sem logotipo de terceiros. Arquivo mostrado: `modelo-judo.cdr`
  (formato `.CDR` pedido no briefing; nenhum outro formato ou versão de software é citado).
- **Troféu 3D**: construído com as **camadas reais** do modelo de judô do catálogo (`img/judo` do site
  Achei Troféus), cada uma vira uma chapa com borda de MDF. A placa mostra o texto editado na
  demonstração (“COPA DO SEU CLIENTE · 2026”) — exemplo ilustrativo de personalização.
- **Lata**: ilustrativa, vermelha lisa, sem marca de terceiros. Sem preço numérico (não confirmado).
- **Cartões do catálogo**: fotos recortadas de `img/cut` do site.
- **“Saiba Mais”** é só chamada visual; o clique é configurado na plataforma do anúncio. O endereço
  `acheiarquivos.com.br` fica na cartela final.
