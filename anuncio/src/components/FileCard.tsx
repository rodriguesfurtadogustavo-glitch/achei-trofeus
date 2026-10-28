import React from 'react';
import {BRAND} from '../config';
import {AXIS_X, BODY_FILL, GOLD_OUTLINES, MODEL_TOP} from '../lib/model';

/**
 * Cartão de arquivo: folha com dobra no canto, espessura fina e etiqueta `.CDR`.
 * Desenho em coordenadas locais (w × h).
 */
export const FileCard: React.FC<{
	w: number;
	h: number;
	label?: string;
	iconOpacity?: number;
	style?: React.CSSProperties;
}> = ({w, h, label = '.CDR', iconOpacity = 1, style}) => {
	const fold = w * 0.26;
	const r = w * 0.07;
	const depth = Math.max(4, w * 0.035);
	const body = `M ${r} 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
	const badgeW = w * 0.52;
	const badgeH = h * 0.15;
	// ícone: o próprio modelo do catálogo (vetor), reduzido
	const iconH = h * 0.44;
	const iconScale = iconH / (416 - MODEL_TOP);
	return (
		<svg width={w + depth} height={h + depth} viewBox={`0 0 ${w + depth} ${h + depth}`} style={{overflow: 'visible', ...style}}>
			<path d={body} transform={`translate(${depth} ${depth})`} fill="#B9B0A3" />
			<path d={body} fill={BRAND.colors.text} />
			<path d={`M ${w - fold} 0 L ${w - fold} ${fold - r * 0.4} Q ${w - fold} ${fold} ${w - fold + r * 0.4} ${fold} L ${w} ${fold} Z`} fill="#D9D1C5" />
			<g transform={`translate(${w * 0.5 - AXIS_X * iconScale} ${h * 0.12 - MODEL_TOP * iconScale}) scale(${iconScale})`} opacity={iconOpacity}>
				{GOLD_OUTLINES.map((d, i) => (
					<path key={i} d={d} fill="#D9AE45" />
				))}
				<path d={BODY_FILL} fill="none" stroke={BRAND.colors.red} strokeWidth={2.4 / iconScale} strokeLinejoin="round" fillRule="evenodd" />
			</g>
			<rect x={w * 0.12} y={h * 0.62} width={w * 0.6} height={Math.max(2, h * 0.022)} rx={2} fill="#CFC7BB" />
			<rect x={w * 0.12} y={h * 0.67} width={w * 0.42} height={Math.max(2, h * 0.022)} rx={2} fill="#CFC7BB" />
			<rect x={w * 0.12} y={h * 0.76} width={badgeW} height={badgeH} rx={badgeH * 0.28} fill={BRAND.colors.red} />
			<text
				x={w * 0.12 + badgeW / 2}
				y={h * 0.76 + badgeH * 0.7}
				textAnchor="middle"
				fontFamily="Inter"
				fontWeight={800}
				fontSize={badgeH * 0.62}
				fill={BRAND.colors.text}
				letterSpacing="0.02em"
			>
				{label}
			</text>
		</svg>
	);
};

export type Rect = {x: number; y: number; w: number; h: number; r: number};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
	x: a.x + (b.x - a.x) * t,
	y: a.y + (b.y - a.y) * t,
	w: a.w + (b.w - a.w) * t,
	h: a.h + (b.h - a.h) * t,
	r: a.r + (b.r - a.r) * t,
});

/** Forma sólida com cantos arredondados: base das transições de forma (cartão ↔ painel ↔ botão). */
export const MorphBox: React.FC<{rect: Rect; color: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({rect, color, children, style}) => (
	<div
		style={{
			position: 'absolute',
			left: rect.x,
			top: rect.y,
			width: rect.w,
			height: rect.h,
			borderRadius: rect.r,
			background: color,
			overflow: 'hidden',
			...style,
		}}
	>
		{children}
	</div>
);
