import {MODEL} from '../data/modelPaths';

/*
 * Geometria compartilhada do modelo “asas” (vetor gerado por scripts/trace_model.py).
 * O desenho 2D e o volume 3D usam exatamente os mesmos contornos.
 * Coordenadas de origem: quadro 520×520 da foto do catálogo (y para baixo).
 */
export const AXIS_X = MODEL.disc.cx;
export const MODEL_TOP = MODEL.top;
export const MODEL_BOTTOM = MODEL.bottom;
export const MODEL_H = MODEL_BOTTOM - MODEL_TOP;
export const MODEL_MID_Y = (MODEL_TOP + MODEL_BOTTOM) / 2;

export const polyD = (p: number[][]) => 'M' + p.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z';

/** Contornos para o traçado a laser (cada um vira um path animado). */
export const BODY_OUTLINES: string[] = MODEL.body.flatMap((s) => [polyD(s.outer), ...s.holes.map(polyD)]);
/** Corpo como um único path com furos (evenodd), para preenchimento. */
export const BODY_FILL = MODEL.body.map((s) => [s.outer, ...s.holes].map(polyD).join(' ')).join(' ');
export const GOLD_OUTLINES: string[] = MODEL.gold.map((s) => polyD(s.outer));

const tier = (t: {y0: number; y1: number; x: number[]}) => {
	const cx = (t.x[0] + t.x[1]) / 2;
	const r = (t.x[1] - t.x[0]) / 2; // sextavado com face de frente: largura total = 2R
	return {cx, r, y0: t.y0, y1: t.y1};
};
export const BASE = {upper: tier(MODEL.base.upper), lower: tier(MODEL.base.lower)};

/** Base vista de frente: retângulo + arestas da face frontal (±R/2). */
export const BASE_OUTLINES: string[] = [BASE.upper, BASE.lower].flatMap((t) => [
	`M ${t.cx - t.r} ${t.y0} L ${t.cx + t.r} ${t.y0} L ${t.cx + t.r} ${t.y1} L ${t.cx - t.r} ${t.y1} Z`,
	`M ${t.cx - t.r / 2} ${t.y0} L ${t.cx - t.r / 2} ${t.y1}`,
	`M ${t.cx + t.r / 2} ${t.y0} L ${t.cx + t.r / 2} ${t.y1}`,
]);

export const DISC = MODEL.disc;
export const DISC_OUTLINE = `M ${DISC.cx - DISC.r} ${DISC.cy} A ${DISC.r} ${DISC.r} 0 1 0 ${DISC.cx + DISC.r} ${DISC.cy} A ${DISC.r} ${DISC.r} 0 1 0 ${DISC.cx - DISC.r} ${DISC.cy} Z`;

/** Posicionamento na tela: eixo em `cx`, topo da peça em `top`, altura total `height` (px). */
export type Placement = {cx: number; top: number; height: number};
export const placementTransform = (p: Placement) => {
	const s = p.height / MODEL_H;
	return {s, x0: p.cx - AXIS_X * s, y0: p.top - MODEL_TOP * s};
};

/** Texto do disco (personalização): mesmo desenho no 2D e na textura do 3D. */
export const DISC_TEXT = {
	kicker: 'CAMPEÃO',
	before: ['NOME DO', 'EVENTO'],
	after: ['COPA DO', 'CLIENTE'],
	year: '2026',
};
