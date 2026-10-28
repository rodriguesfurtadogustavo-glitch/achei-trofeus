import React from 'react';
import {BRAND} from '../config';
import {BASE_OUTLINES, BODY_FILL, BODY_OUTLINES, DISC, DISC_OUTLINE, DISC_TEXT, GOLD_OUTLINES, Placement, placementTransform} from '../lib/model';
import {LaserPath} from './Laser';

/*
 * Desenho vetorial do modelo “asas” do catálogo: traçado a laser, nós de edição, troca do texto
 * do disco e preenchimento (preto, dourado, MDF) antes de virar volume.
 */
const ALL = [...BODY_OUTLINES, ...GOLD_OUTLINES, DISC_OUTLINE, ...BASE_OUTLINES];

const nodePoints = (() => {
	const pts: [number, number][] = [];
	for (const d of [...BODY_OUTLINES, ...GOLD_OUTLINES]) {
		const nums = d.replace(/[MLZ]/g, ' ').trim().split(/[\s,]+/).map(Number);
		const step = d === BODY_OUTLINES[0] ? 2 * 9 : 2 * 7;
		for (let i = 0; i < nums.length; i += step) pts.push([nums[i], nums[i + 1]]);
	}
	return pts;
})();

export const DiscText: React.FC<{lines: string[]; caret?: boolean; color?: string; muted?: boolean}> = ({lines, caret, color = BRAND.colors.bg, muted}) => {
	const {cx, cy, r} = DISC;
	return (
		<g>
			<text x={cx} y={cy - r * 0.42} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={r * 0.17} letterSpacing={r * 0.03} fill={BRAND.colors.red}>
				{DISC_TEXT.kicker}
			</text>
			{lines.map((l, i) => (
				<text key={i} x={cx} y={cy - r * 0.02 + i * r * 0.36} textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize={r * 0.33} fill={color} opacity={muted ? 0.45 : 1}>
					{l}
					{caret && i === lines.length - 1 ? <tspan fill={BRAND.colors.laser}>|</tspan> : null}
				</text>
			))}
			<text x={cx} y={cy + r * 0.78} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={r * 0.15} fill={color} opacity={0.75}>
				{DISC_TEXT.year}
			</text>
		</g>
	);
};

export const ModelDrawing: React.FC<{
	place: Placement;
	draw: number;
	nodes?: number;
	select?: number;
	lines?: string[];
	caret?: boolean;
	muted?: boolean;
	fill?: number;
	lineOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	discText?: number;
}> = ({place, draw, nodes = 0, select = 0, lines = DISC_TEXT.before, caret = false, muted = false, fill = 0, lineOpacity = 1, stroke = BRAND.colors.text, strokeWidth = 2.6, discText = 1}) => {
	const {s, x0, y0} = placementTransform(place);
	const lw = strokeWidth / s;
	const {cx, cy, r} = DISC;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
			<g transform={`translate(${x0} ${y0}) scale(${s})`}>
				{/* preenchimento: chapa preta, asas douradas, disco e base */}
				<g opacity={fill}>
					<path d={BODY_FILL} fill="#151517" fillRule="evenodd" />
					{GOLD_OUTLINES.map((d, i) => (
						<path key={i} d={d} fill="#D9AE45" />
					))}
					{BASE_OUTLINES.filter((_, i) => i % 3 === 0).map((d, i) => (
						<path key={`b${i}`} d={d} fill="#151517" />
					))}
				</g>
				<circle cx={cx} cy={cy} r={r} fill="#F3F1ED" opacity={Math.max(fill, Math.min(1, draw * 1.4) * 0.12)} />
				<g opacity={lineOpacity}>
					{ALL.map((d, i) => {
						const local = Math.max(0, Math.min(1, draw * 1.7 - i * (0.7 / ALL.length)));
						return <LaserPath key={i} d={d} progress={local} width={lw} color={draw >= 1 ? stroke : BRAND.colors.laser} head={i < 2} glow={draw >= 1 ? 0 : 0.7} />;
					})}
				</g>
				<g opacity={Math.min(1, draw * 1.5) * discText}>
					<DiscText lines={lines} caret={caret} color={fill > 0.5 ? BRAND.colors.bg : stroke} muted={muted} />
				</g>
				<g opacity={nodes}>
					{nodePoints.map(([x, y], i) => (
						<rect key={i} x={x - 5 / s} y={y - 5 / s} width={10 / s} height={10 / s} fill={BRAND.colors.bg} stroke={BRAND.colors.laser} strokeWidth={1.8 / s} />
					))}
				</g>
				<g opacity={select}>
					<rect x={cx - r - 6} y={cy - r - 6} width={2 * r + 12} height={2 * r + 12} fill="none" stroke={BRAND.colors.laser} strokeWidth={2 / s} strokeDasharray={`${9 / s} ${6 / s}`} />
					{[
						[cx - r - 6, cy - r - 6],
						[cx + r + 6, cy - r - 6],
						[cx - r - 6, cy + r + 6],
						[cx + r + 6, cy + r + 6],
					].map(([x, y], i) => (
						<rect key={i} x={x - 7 / s} y={y - 7 / s} width={14 / s} height={14 / s} fill={BRAND.colors.text} stroke={BRAND.colors.laser} strokeWidth={2 / s} />
					))}
				</g>
			</g>
		</svg>
	);
};
