"""Vetoriza o modelo “asas” (public/models/modelo-asas.webp) por cor: corpo preto, asas douradas,
disco branco e base sextavada. Saída: src/data/modelPaths.ts (coordenadas no quadro 520×520).
Uso: python -I scripts/trace_model.py   (numpy + opencv-python-headless<5)
"""
import json, os, sys
import cv2, numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
img = cv2.imread(os.path.join(ROOT, "public/models/modelo-asas.webp"))
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
H, S, V = [hsv[:, :, i].astype(np.int32) for i in range(3)]
UP = 4

dark = ((V < 85) & (S < 160)).astype(np.uint8) * 255
gold = ((H >= 10) & (H <= 36) & (S > 75) & (V > 95)).astype(np.uint8) * 255
white = ((S < 32) & (V > 200)).astype(np.uint8) * 255


def clean(m, k=3):
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((k, k), np.uint8))
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))


dark, gold = clean(dark), clean(gold, 5)
# disco: componente branco que não toca a borda e fica dentro do anel
n, lab, stats, cent = cv2.connectedComponentsWithStats(white)
disc = np.zeros_like(white)
best = max((i for i in range(1, n) if stats[i, 0] > 0 and stats[i, 1] > 0 and stats[i, 0] + stats[i, 2] < 519 and stats[i, 1] + stats[i, 3] < 519), key=lambda i: stats[i, 4])
disc[lab == best] = 255
(dcx, dcy), dr = cv2.minEnclosingCircle(cv2.findNonZero(disc))

# Medidas da base sextavada (lidas na imagem; foto levemente de cima, vértice voltado à câmera):
# o pé arredondado do corpo apoia em y=416; andar de cima 416–447 (largura 166–351),
# andar de baixo 447–479 (largura 148–370).
BODY_BOTTOM = 416
upper = {"y0": 416, "y1": 447, "x": [166, 351]}
lower = {"y0": 447, "y1": 479, "x": [148, 370]}
ys = np.nonzero(dark.any(axis=1))[0]
top, bottom = int(ys.min()), 479
# chapa preta = silhueta inteira (preto + dourado + disco), só com o vão do “V” vazado
body = ((dark > 0) | (gold > 0) | (disc > 0)).astype(np.uint8) * 255
body = cv2.morphologyEx(body, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
body[BODY_BOTTOM:] = 0
gold[BODY_BOTTOM:] = 0


def trace(mask, min_area=60, blur=3, eps=1.4):
    big = cv2.resize(cv2.GaussianBlur(mask, (blur, blur), 0), None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
    big = (big > 127).astype(np.uint8) * 255
    cs, hier = cv2.findContours(big, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    shapes = []
    if hier is None:
        return shapes
    for i, c in enumerate(cs):
        if hier[0][i][3] != -1 or cv2.contourArea(c) < min_area * UP * UP:
            continue
        def pts(cc):
            a = cv2.approxPolyDP(cc, eps, True)[:, 0, :] / UP
            return [[round(float(x), 2), round(float(y), 2)] for x, y in a]
        holes = []
        j = hier[0][i][2]
        while j != -1:
            if cv2.contourArea(cs[j]) > 400 * UP * UP:
                holes.append(pts(cs[j]))
            j = hier[0][j][0]
        shapes.append({"outer": pts(c), "holes": holes, "area": float(cv2.contourArea(c)) / UP / UP})
    return sorted(shapes, key=lambda s: -s["area"])


data = {
    "frame": [520, 520],
    "top": top,
    "bottom": bottom,
    "disc": {"cx": round(dcx, 2), "cy": round(dcy, 2), "r": round(dr, 2)},
    "body": trace(body),
    "gold": trace(gold, 40, blur=7, eps=2.2),
    "base": {"upper": upper, "lower": lower},
}
print(json.dumps({k: (v if k not in ("body", "gold") else [(round(s["area"]), len(s["outer"]), len(s["holes"])) for s in v]) for k, v in data.items()}), file=sys.stderr)
dbg = img.copy()
for s in data["body"]:
    cv2.polylines(dbg, [np.array(s["outer"], np.int32)] + [np.array(h, np.int32) for h in s["holes"]], True, (255, 0, 255), 1)
for s in data["gold"]:
    cv2.polylines(dbg, [np.array(s["outer"], np.int32)], True, (0, 0, 255), 1)
cv2.circle(dbg, (int(dcx), int(dcy)), int(dr), (0, 200, 0), 1)
for t in (upper, lower):
    cv2.rectangle(dbg, (t["x"][0], t["y0"]), (t["x"][1], t["y1"]), (255, 128, 0), 1)
if len(sys.argv) > 1:
    cv2.imwrite(sys.argv[1], cv2.resize(dbg, None, fx=2, fy=2))
out = "// Gerado por scripts/trace_model.py — não editar à mão.\n"
out += "// Modelo “asas” do catálogo Achei Arquivos, vetorizado por cor (quadro 520×520).\n"
out += "export type Poly = number[][];\nexport type VShape = {outer: Poly; holes: Poly[]; area: number};\n"
out += "export const MODEL: {frame: number[]; top: number; bottom: number; disc: {cx: number; cy: number; r: number}; body: VShape[]; gold: VShape[]; base: {upper: {y0: number; y1: number; x: number[]}; lower: {y0: number; y1: number; x: number[]}}} = "
out += json.dumps(data) + ";\n"
open(os.path.join(ROOT, "src/data/modelPaths.ts"), "w").write(out)
