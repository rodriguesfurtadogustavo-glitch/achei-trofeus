import React from 'react';
import {BRAND} from '../config';

/*
 * Marca Achei Arquivos redesenhada em vetor a partir do cabeçalho do site
 * (quadrado arredondado creme, ponto e telhado vermelhos, porta creme). Medidas em viewBox 100.
 */
export const LogoMark: React.FC<{size: number; draw?: number; style?: React.CSSProperties}> = ({size, draw = 1, style}) => {
	const p = Math.max(0, Math.min(1, draw));
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={style}>
			<rect x={2.5} y={2.5} width={95} height={95} rx={22} fill="none" stroke={BRAND.colors.text} strokeWidth={3.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
			<g opacity={Math.min(1, p * 1.6)}>
				<circle cx={50} cy={23} r={4.3} fill={BRAND.colors.laser} />
				<path d="M 31.5 68 V 48.4 L 50 32.8 L 68.5 48.4 V 68" fill="none" stroke={BRAND.colors.laser} strokeWidth={5.4} strokeLinejoin="miter" />
				<path d="M 41 68 V 54.4 H 59 V 68" fill="none" stroke={BRAND.colors.text} strokeWidth={4.4} />
			</g>
		</svg>
	);
};

export const Wordmark: React.FC<{size: number}> = ({size}) => (
	<div style={{fontFamily: BRAND.fonts.title, fontWeight: 800, fontSize: size, letterSpacing: '-0.025em', lineHeight: 1, whiteSpace: 'nowrap'}}>
		<span style={{color: BRAND.colors.text}}>Achei </span>
		<span style={{color: BRAND.colors.laser}}>Arquivos</span>
	</div>
);
