#!/usr/bin/env bash
# Masterização final: loudnorm em duas passagens (-16 LUFS integrados, pico verdadeiro ≤ -1 dBTP),
# AAC 48 kHz; vídeo convertido para yuv420p em faixa limitada (TV/BT.709), o formato mais compatível
# com as plataformas de anúncio (o render sai em yuvj420p). Uso: scripts/master.sh entrada.mp4 saida.mp4
set -euo pipefail
IN="${1:-out/_render.mp4}"
OUT="${2:-out/achei-arquivos-anuncio.mp4}"
TARGET="I=-16:TP=-1.5:LRA=11"
JSON=$(ffmpeg -hide_banner -nostats -i "$IN" -af "loudnorm=${TARGET}:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -v error -y -i "$IN" -map 0:v:0 -map 0:a:0 \
  -vf "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 16 -profile:v high -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -r 30 \
  -af "loudnorm=${TARGET}:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
echo "Medição final:"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary:" | grep -E "I:|Peak:|LRA:"
