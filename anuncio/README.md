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

# 2) (opcional) refazer o vetor do modelo “asas”      (numpy + opencv-python-headless<5)
python -I scripts/trace_model.py

# prévia interativa
npx remotion studio

# quadros de inspeção (out/samples/)
node scripts/stills.mjs 30 400 870 1370 1450

# 3) renderização
npx remotion render AcheiArquivos out/_render.mp4 --crf=16

# 4) masterização: loudnorm em 2 passagens + vídeo em yuv420p BT.709 (compatível com plataformas)
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
  data/modelPaths.ts    ← vetor do modelo “asas” do catálogo: corpo, asas, disco, base (gerado)
  lib/model.ts          ← geometria compartilhada entre o desenho 2D e o volume 3D
  config.ts             ← marca (cores, fontes), intensidade, marcações das cenas, câmera, efeitos, mixagem
  Composition.tsx       ← ordem das camadas
  components/           ← Presenter (vídeo + reenquadramento), Captions, Title, Laser, FileCard/MorphBox,
                          PhotoCard, ModelDrawing, Trophy3D, SodaCan3D, Logo, EndCard, Grain, AudioMix
  scenes/Scene1..7.tsx  ← direção de cada cena
public/
  videos/               ← os 7 takes originais (cópia intacta dos anexos)
  models/               ← 5 renders oficiais dos modelos do catálogo Achei Arquivos
  site/catalogo.mp4     ← trecho da gravação da página (3,4–8,0 s, acelerado 2×, sem barra de status)
  ui/                   ← ícone do editor (enviado pela cliente) e textura de grão
  audio/                ← voice.wav, music.wav, sfx-*.wav (gerados por prepare_audio.py)
  fonts/                ← Bricolage Grotesque e Inter (OFL), empacotadas localmente
scripts/                ← prepare_audio.py, trace_model.py, stills.mjs, make_srt.mjs, master.sh
```

Tudo é determinado pelo frame (sem `Math.random` nem relógio): o mesmo frame sempre gera a mesma imagem.

## Montagem final (cortes conferidos)

Os cortes foram medidos pela energia do áudio (a transcrição automática adianta o início das falas).
Cada take começa ~0,13 s antes da primeira sílaba (sem a respiração antes de falar) e termina
~0,15 s depois da última. Pausas longas dentro de um take viram **jump cuts**, disfarçados por uma
troca leve de zoom. As emendas caem sempre em silêncio.

| # | Arquivo | Trechos (frames de origem) | Timeline |
|---|---|---|---|
| 1 | IMG_3418 | 120–160, 169–308 (pausa em “você que… já vende”) | 0,000 → 5,967 s |
| 2 | IMG_3420 | 89–333 | 5,967 → 14,100 s |
| 3 | IMG_3421 | 100–288 | 14,100 → 20,367 s |
| 4 | IMG_3423 | 113–387 | 20,367 → 29,500 s |
| 5 | IMG_3427 | 44–137 | 29,500 → 32,600 s |
| 6 | IMG_3431 | 45–54, 66–280 (pausa em “É… a oportunidade”) | 32,600 → 40,033 s |
| 7 | IMG_3432 | 91–144, 151–232 (pausa entre “modelos?” e “Clique”) | 40,033 → 44,500 s |
| Fecho | cartela | 60 frames | 44,500 → 46,500 s |

**Total: 1.395 frames = 46,5 s.** Voz sempre em 1×; as transições gráficas ficam por cima dos cortes.

### Enquadramento
- **Fechado** (padrão): o rosto vai para o centro, ~1,3× maior, sem o espaço vazio acima da cabeça.
- **Aberto** (quadro original) só enquanto há título/elemento na faixa de cima; a câmera abre ~0,4 s
  antes de o elemento entrar e fecha de novo quando ele sai (`WIDE` e `FRAMING` em `config.ts`).
- **Demonstração (cena 4)**: o rosto sobe para a metade de cima e o vídeo amplia (~1,36×) o
  bastante para continuar cobrindo o quadro inteiro — embaixo do painel aparecem as mãos e a mesa,
  sem faixa vazia (`DEMO_FRAMING` em `config.ts`).
- A ampliação extra torna a imagem um pouco mais macia (os anexos têm 512 × 910).

## Áudio

- **Voz**: cortes exatos por amostra, passa-altas 80 Hz, redução de ruído suave (afftdn 8 dB),
  compressão 2,5:1, cada take nivelado a −19 LUFS (diferenças entre takes eram de até 1,7 LU),
  fades de 12 ms nas emendas.
- **Música**: trilha instrumental **original, sintetizada por `prepare_audio.py`** (110 BPM, Lá menor):
  bumbo/palmas/chimbal limpos, pad e teclas com reverb e “respiração” no bumbo (sidechain), baixo,
  arpejo na construção e um motivo melódico na chamada que resolve na cartela. Bancos de música livre
  não estavam acessíveis neste ambiente; trocar `public/audio/music.wav` por uma trilha licenciada
  (normalizada a −25 LUFS) mantém o ducking automático.
- **Ducking**: a música desce ~12 dB sob a fala (fica ~16–18 dB abaixo da voz; um pouco mais presente nas cenas 6–7), calculado das legendas (`MIX` em `config.ts`).
- **Efeitos**: laser, passagem de cartão, toque de montagem da peça, lata e acento da chamada.
- **Master**: `scripts/master.sh` → −16 LUFS integrados, pico verdadeiro ≤ −1 dBTP.

## Ativos e decisões a conferir

- **Nome da apresentadora**: a transcrição ouviu “Karoline”; o README do site cita o perfil
  `@karuliny.t.r`, então a legenda usa **“Karuliny”**. A identificação visual usa **Karu**.
  Conferir a grafia na escuta antes de veicular (`src/data/edit.json`, legenda “Eu sou …”).
- Correções sobre a transcrição automática: “vem de troféus” → **vende troféus**; “Clique agora e saiba
  mais” → **em Saiba Mais**; “colocar a parte da” → **colocar parte da**.
- **Logo**: redesenhado em vetor (`components/Logo.tsx`) a partir do cabeçalho de acheiarquivos.com.br
  visto na gravação da página; a palavra “Achei Arquivos” segue o site (creme + vermelho).
  Trocar pelo SVG oficial, se houver.
- **Modelos**: os cartões das cenas 2 e 6 e a peça da demonstração usam os 5 renders oficiais do
  catálogo enviados pela cliente.
- **Troféu 3D**: construído a partir do **vetor do modelo “asas”** (mesmos contornos do desenho 2D):
  chapa preta extrudada com borda de MDF, asas douradas com a textura da própria foto, disco com o
  texto editado na demonstração (“CAMPEÃO · COPA DO CLIENTE · 2026”, exemplo ilustrativo) e base
  sextavada em dois andares modelada em 3D.
- **Editor**: interface abstrata com o rótulo **“Demonstração ilustrativa”**; o ícone verde é o que a
  cliente enviou para representar o Corel. Arquivo mostrado: `modelo-asas.cdr` (formato `.CDR`
  do briefing; nenhuma versão de software é citada).
- **Preço**: “R$ 8,99 por modelo” entra na cena 5 porque aparece na página atual do catálogo
  (“Cada projeto sai por R$ 8,99”, gravação de 28/10/2026). Retirar se a oferta mudar.
- **Página do site**: cena 7 mostra um trecho real da página do catálogo dentro de um celular, que se
  transforma no botão **Saiba Mais**, agora na parte de baixo do quadro (centro em y ≈ 1427).
- **Lata**: ilustrativa, vermelha lisa, sem marca de terceiros.
- **“Saiba Mais”** é só chamada visual; o clique é configurado na plataforma do anúncio. O endereço
  `acheiarquivos.com.br` fica na cartela final.
