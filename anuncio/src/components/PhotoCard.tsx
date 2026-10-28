import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND} from '../config';

/** Modelos do catálogo Achei Arquivos (renders oficiais, fundo bege). */
export const MODELS = {
	asas: 'models/modelo-asas.webp',
	v: 'models/modelo-v.webp',
	chama: 'models/modelo-chama.webp',
	bola: 'models/modelo-bola.webp',
	onda: 'models/modelo-onda.webp',
};

/** Cartão com a foto do modelo ocupando o cartão inteiro, cantos arredondados e friso vermelho. */
export const PhotoCard: React.FC<{src: string; w: number; h: number; style?: React.CSSProperties; glow?: number; zoom?: number}> = ({src, w, h, style, glow = 0, zoom = 1.12}) => (
	<div
		style={{
			width: w,
			height: h,
			borderRadius: Math.min(w, h) * 0.085,
			overflow: 'hidden',
			position: 'relative',
			background: '#E9DCCB',
			boxShadow: `0 28px 60px rgba(0,0,0,0.42), 0 0 0 1.5px rgba(245,242,237,0.16), 0 0 ${46 * glow}px rgba(255,58,46,${0.45 * glow})`,
			...style,
		}}
	>
		<Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
		<div style={{position: 'absolute', left: '14%', right: '14%', bottom: '5%', height: 4, borderRadius: 2, background: BRAND.colors.red, boxShadow: `0 0 10px ${BRAND.colors.laser}`}} />
	</div>
);
