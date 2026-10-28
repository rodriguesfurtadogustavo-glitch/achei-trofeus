import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND} from '../config';

/** Cartão com a foto real de um modelo do catálogo (recorte sem fundo). */
export const CatalogCard: React.FC<{src: string; w: number; h: number; style?: React.CSSProperties; glow?: number}> = ({src, w, h, style, glow = 0}) => (
	<div
		style={{
			width: w,
			height: h,
			borderRadius: w * 0.09,
			background: `radial-gradient(120% 80% at 50% 18%, #26262A 0%, ${BRAND.colors.surface} 62%)`,
			border: '1.5px solid rgba(245,242,237,0.10)',
			boxShadow: `0 30px 60px rgba(0,0,0,0.45), 0 0 ${40 * glow}px rgba(255,58,46,${0.35 * glow})`,
			position: 'relative',
			overflow: 'hidden',
			...style,
		}}
	>
		<Img
			src={staticFile(src)}
			style={{position: 'absolute', left: '9%', top: '7%', width: '82%', height: '80%', objectFit: 'contain'}}
		/>
		<div
			style={{
				position: 'absolute',
				left: '12%',
				right: '12%',
				bottom: '6.5%',
				height: 4,
				borderRadius: 2,
				background: BRAND.colors.red,
				boxShadow: `0 0 12px ${BRAND.colors.laser}`,
			}}
		/>
	</div>
);
