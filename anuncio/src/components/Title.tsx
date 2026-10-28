import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ANIM, BRAND} from '../config';
import {easeIn, easeOut, life, prog} from '../lib/anim';

/**
 * Cartão escuro discreto para títulos sobre o fundo claro da gravação.
 * Entra em 8 frames (escala + revelação lateral) e sai em 6 frames.
 */
export const TitleCard: React.FC<{
	start: number;
	end: number;
	top: number;
	children: React.ReactNode;
	left?: number;
	right?: number;
	align?: 'center' | 'left';
	padding?: string;
	background?: string;
	radius?: number;
	style?: React.CSSProperties;
}> = ({start, end, top, children, left = 96, right = 96, align = 'center', padding = '24px 38px 28px', background = 'rgba(11,11,12,0.92)', radius = 26, style}) => {
	const f = useCurrentFrame();
	if (f < start || f >= end) return null;
	const enter = prog(f, start, ANIM.titleIn);
	const exit = prog(f, end - ANIM.titleOut, ANIM.titleOut, easeIn);
	const s = 0.9 + 0.1 * enter;
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left,
				right,
				display: 'flex',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				transform: `translateY(${(1 - enter) * 26 - exit * 30}px) scale(${s})`,
				opacity: 1 - exit,
			}}
		>
			<div
				style={{
					background,
					borderRadius: radius,
					padding,
					clipPath: `inset(0 ${(1 - enter) * 100}% 0 0 round ${radius}px)`,
					boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
					...style,
				}}
			>
				{children}
			</div>
		</div>
	);
};

/** Palavras que sobem de uma máscara, uma a uma (atraso de 2 frames). */
export const Words: React.FC<{
	text: string;
	start: number;
	size: number;
	color?: string;
	font?: string;
	weight?: number;
	stagger?: number;
	emphasis?: Record<string, React.CSSProperties>;
	letterSpacing?: string;
	lineHeight?: number;
	align?: 'center' | 'left';
}> = ({text, start, size, color = BRAND.colors.text, font = BRAND.fonts.title, weight = 800, stagger = 2, emphasis = {}, letterSpacing = '-0.02em', lineHeight = 1.0, align = 'center'}) => {
	const f = useCurrentFrame();
	const words = text.split(' ');
	return (
		<div
			style={{
				fontFamily: font,
				fontWeight: weight,
				fontSize: size,
				color,
				letterSpacing,
				lineHeight,
				textAlign: align,
				whiteSpace: 'nowrap',
			}}
		>
			{words.map((w, i) => {
				const t = prog(f, start + i * stagger, 9, easeOut);
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.22, marginBottom: -size * 0.22, paddingTop: size * 0.12, marginTop: -size * 0.12}}>
						<span
							style={{
								display: 'inline-block',
								transform: `translateY(${(1 - t) * 105}%)`,
								...emphasis[w],
							}}
						>
							{w}
						</span>
						{i < words.length - 1 ? ' ' : null}
					</span>
				);
			})}
		</div>
	);
};

export const useLife = (start: number, end: number) => life(useCurrentFrame(), start, end);
