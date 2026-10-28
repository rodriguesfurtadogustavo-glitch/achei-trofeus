import React from 'react';
import {BRAND} from '../config';
import {JUDO_LAYERS} from '../data/judoPaths';
import {LaserPath} from './Laser';

/*
 * Desenho vetorial do troféu de judô, a partir dos contornos REAIS das camadas do catálogo
 * (scripts/trace_judo.py). Usado na demonstração: traçado a laser, nós de edição, troca do
 * texto da placa e preenchimento MDF antes de virar volume.
 */
const pick = (id: string, minArea: number) => JUDO_LAYERS[id].paths.filter((p) => p.area >= minArea).map((p) => p.d);

export const DRAWING_PATHS: string[] = [
	...pick('l1', 5000),
	...pick('l2', 2000),
	...pick('l3', 5000),
	...pick('l4', 5000),
	...pick('l5', 5000),
];

const nodePoints = (() => {
	const pts: [number, number][] = [];
	for (const id of ['l1', 'l2', 'l4']) {
		for (const p of JUDO_LAYERS[id].paths.slice(0, id === 'l2' ? 2 : 1)) {
			const nums = p.d.replace(/[MLZ]/g, ' ').trim().split(/[\s,]+/).map(Number);
			for (let i = 0; i < nums.length; i += 2 * 3) pts.push([nums[i], nums[i + 1]]);
		}
	}
	return pts;
})();

const PLAQUE = {x: 45, y: 1128, w: 622, h: 138};

export const VectorDrawing: React.FC<{
	/** retângulo de tela onde o quadro 760×1330 da arte é desenhado */
	left: number;
	top: number;
	height: number;
	draw: number;
	nodes: number;
	select: number;
	text: string;
	sub: string;
	caret: boolean;
	fill: number;
	lineOpacity?: number;
	stroke?: string;
}> = ({left, top, height, draw, nodes, select, text, sub, caret, fill, lineOpacity = 1, stroke = BRAND.colors.text}) => {
	const s = height / 1330;
	const lw = 2.4 / s;
	return (
		<svg
			width={760 * s}
			height={1330 * s}
			viewBox="0 0 760 1330"
			style={{position: 'absolute', left, top, overflow: 'visible'}}
		>
			{/* preenchimento MDF (antes do volume) */}
			<g opacity={fill}>
				{DRAWING_PATHS.slice(0, 1).map((d, i) => (
					<path key={i} d={d} fill={BRAND.colors.mdf} opacity={0.9} />
				))}
				{pick('l4', 5000).map((d, i) => (
					<path key={`b${i}`} d={d} fill={BRAND.colors.mdfEdge} opacity={0.9} />
				))}
			</g>
			<g opacity={lineOpacity}>
				{DRAWING_PATHS.map((d, i) => {
					const local = Math.max(0, Math.min(1, draw * 1.6 - i * (0.6 / DRAWING_PATHS.length)));
					return <LaserPath key={i} d={d} progress={local} width={lw} color={draw >= 1 ? stroke : BRAND.colors.laser} head={i < 3} glow={draw >= 1 ? 0 : 0.8} />;
				})}
			</g>
			{/* texto da placa (editável) */}
			<g opacity={Math.min(1, draw * 1.5) * lineOpacity}>
				<text x={PLAQUE.x + PLAQUE.w / 2} y={PLAQUE.y + 70} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={46} fill={stroke}>
					{text}
					{caret ? <tspan fill={BRAND.colors.laser}>|</tspan> : null}
				</text>
				<text x={PLAQUE.x + PLAQUE.w / 2} y={PLAQUE.y + 112} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill={stroke} opacity={0.8}>
					{sub}
				</text>
			</g>
			{/* nós de edição */}
			<g opacity={nodes}>
				{nodePoints.map(([x, y], i) => (
					<rect key={i} x={x - 6 / s} y={y - 6 / s} width={12 / s} height={12 / s} fill={BRAND.colors.bg} stroke={BRAND.colors.laser} strokeWidth={2 / s} />
				))}
			</g>
			{/* caixa de seleção da placa */}
			<g opacity={select}>
				<rect x={PLAQUE.x - 10} y={PLAQUE.y - 10} width={PLAQUE.w + 20} height={PLAQUE.h + 20} fill="none" stroke={BRAND.colors.laser} strokeWidth={2.2 / s} strokeDasharray={`${10 / s} ${7 / s}`} />
				{[
					[PLAQUE.x - 10, PLAQUE.y - 10],
					[PLAQUE.x + PLAQUE.w + 10, PLAQUE.y - 10],
					[PLAQUE.x - 10, PLAQUE.y + PLAQUE.h + 10],
					[PLAQUE.x + PLAQUE.w + 10, PLAQUE.y + PLAQUE.h + 10],
				].map(([x, y], i) => (
					<rect key={i} x={x - 8 / s} y={y - 8 / s} width={16 / s} height={16 / s} fill={BRAND.colors.text} stroke={BRAND.colors.laser} strokeWidth={2 / s} />
				))}
			</g>
		</svg>
	);
};
