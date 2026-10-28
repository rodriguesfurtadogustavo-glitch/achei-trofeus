import React from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';
import {BRAND} from '../config';

/**
 * Linha de laser: o traço é desenhado conforme `progress` (0→1), com brilho e uma
 * cabeça luminosa no ponto de corte. Use dentro de um <svg>.
 */
export const LaserPath: React.FC<{
	d: string;
	progress: number;
	width?: number;
	color?: string;
	head?: boolean;
	opacity?: number;
	glow?: number;
}> = ({d, progress, width = 6, color = BRAND.colors.laser, head = true, opacity = 1, glow = 1}) => {
	const len = getLength(d);
	const p = Math.max(0, Math.min(1, progress));
	if (p <= 0) return null;
	const pt = getPointAtLength(d, len * p);
	const dash = {strokeDasharray: `${len} ${len}`, strokeDashoffset: len * (1 - p)};
	return (
		<g opacity={opacity}>
			{glow > 0 ? (
				<path d={d} fill="none" stroke={color} strokeWidth={width * 3.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.22 * glow} style={{...dash, filter: `blur(${width * 1.2}px)`}} />
			) : null}
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={dash} />
			{head && pt && p < 0.999 ? (
				<g>
					<circle cx={pt.x} cy={pt.y} r={width * 2.6} fill={color} opacity={0.35} style={{filter: `blur(${width * 1.5}px)`}} />
					<circle cx={pt.x} cy={pt.y} r={width * 0.9} fill="#FFF4EC" />
				</g>
			) : null}
		</g>
	);
};

/** SVG de quadro inteiro (1080×1920) para desenhar linhas sobre a composição. */
export const FullFrameSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
		{children}
	</svg>
);
