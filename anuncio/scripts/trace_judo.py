"""Gera os contornos vetoriais (SVG paths) e as máscaras das camadas do troféu de judô.

Entrada: public/judo/l1..l5.webp (camadas recortadas do catálogo, mesmo quadro 760x1330).
Saída:  src/data/judoPaths.ts  (paths por camada + caixas) e public/judo/m1..m5.png (máscaras p/ alphaMap).
Uso:    python -I scripts/trace_judo.py   (requer numpy e opencv-python-headless<5)
"""
import json, os, sys
import cv2, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
layers = {}
for i in range(1, 6):
    img = cv2.imread(os.path.join(ROOT, f"public/judo/l{i}.webp"), cv2.IMREAD_UNCHANGED)
    alpha = img[:, :, 3]
    mask = (alpha > 127).astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    cv2.imwrite(os.path.join(ROOT, f"public/judo/m{i}.png"), mask)
    contours, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    paths = []
    for c in contours:
        if cv2.contourArea(c) < 250:
            continue
        a = cv2.approxPolyDP(c, 1.6, True)[:, 0, :]
        d = "M" + " L".join(f"{x} {y}" for x, y in a) + " Z"
        paths.append({"d": d, "area": float(cv2.contourArea(c)), "points": len(a)})
    paths.sort(key=lambda p: -p["area"])
    ys, xs = np.nonzero(mask)
    layers[f"l{i}"] = {"box": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], "paths": paths}
    print(f"l{i}", layers[f"l{i}"]["box"], [(round(p["area"]), p["points"]) for p in paths][:8], file=sys.stderr)

out = "// Gerado por scripts/trace_judo.py — não editar à mão.\n"
out += "// Contornos das camadas reais do troféu de judô do catálogo (quadro 760x1330).\n"
out += "export const JUDO_FRAME = {width: 760, height: 1330};\n"
out += "export const JUDO_LAYERS: Record<string, {box: [number, number, number, number]; paths: {d: string; area: number; points: number}[]}> = "
out += json.dumps(layers) + ";\n"
open(os.path.join(ROOT, "src/data/judoPaths.ts"), "w").write(out)
