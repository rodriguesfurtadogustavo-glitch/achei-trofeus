import React from 'react';
import {interpolateColors, useCurrentFrame} from 'remotion';
import {BRAND, CUE, END_CARD_START} from '../config';
import {easeIn, easeInOut, easeOut, prog, pulse} from '../lib/anim';
import {CatalogCard} from '../components/CatalogCard';
import {MorphBox, lerpRect, Rect} from '../components/FileCard';
import {TitleCard, Words} from '../components/Title';

// Cena 7 — converter a atenção em visita.
const CARD_W = 220;
const CARD_H = 272;
const CARD_Y = 1066;
const EXAMPLES = ['catalog/futebol.webp', 'catalog/judo.webp', 'catalog/tenis.webp'];
const BUTTON: Rect = {x: 170, y: 1094, w: 740, h: 156, r: 78};
const FULL: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0};

export const Scene7: React.FC = () => {
	const f = useCurrentFrame();
	const {conheça, saiba, pulse: pulseAt, toEnd} = CUE.s7;
	if (f < conheça - 2 || f >= END_CARD_START + 2) return null;

	const morph = prog(f, saiba - 7, 10, easeInOut);
	const toFull = prog(f, toEnd, 10, easeInOut);
	const middle: Rect = {x: 540 - CARD_W / 2, y: CARD_Y, w: CARD_W, h: CARD_H, r: CARD_W * 0.09};
	let rect = lerpRect(middle, BUTTON, morph);
	if (f >= toEnd) rect = lerpRect(BUTTON, FULL, toFull);
	// o botão cresce em vermelho até cobrir o quadro; a cartela final entra por cima com a linha de laser
	const color = interpolateColors(morph, [0, 1], [BRAND.colors.surface, BRAND.colors.red]);
	const p = pulse(f, pulseAt, 12);
	const labelIn = prog(f, saiba - 1, 8, easeOut);

	return (
		<>
			<TitleCard start={conheça - 2} end={saiba - 2} top={236}>
				<Words text="CONHEÇA" start={conheça} size={112} />
				<Words text="OS MODELOS" start={conheça + 4} size={112} emphasis={{MODELOS: {color: BRAND.colors.laser}}} />
			</TitleCard>
			{EXAMPLES.map((src, i) => {
				const t = prog(f, conheça + 6 + i * 3, 12, easeOut);
				const leave = i === 1 ? 0 : prog(f, saiba - 8, 7, easeIn);
				if (i === 1 && morph > 0) return null;
				return (
					<div
						key={src}
						style={{
							position: 'absolute',
							left: 540 - CARD_W / 2 + (i - 1) * 262 + (i - 1) * leave * 140,
							top: CARD_Y + (1 - t) * 160,
							opacity: t * (1 - leave),
							transform: `rotate(${(i - 1) * 4 * (1 - t)}deg)`,
						}}
					>
						<CatalogCard src={src} w={CARD_W} h={CARD_H} />
					</div>
				);
			})}
			{morph > 0 ? (
				<MorphBox
					rect={rect}
					color={color}
					style={{
						transform: `scale(${1 + 0.06 * p})`,
						boxShadow: f < toEnd ? `0 20px 50px rgba(226,35,26,${0.35 + 0.3 * p})` : undefined,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{f < toEnd + 4 ? (
						<div
							style={{
								fontFamily: BRAND.fonts.title,
								fontWeight: 800,
								fontSize: 84,
								letterSpacing: '-0.01em',
								color: BRAND.colors.text,
								whiteSpace: 'nowrap',
								opacity: labelIn * (1 - prog(f, toEnd, 4)),
								transform: `translateY(${(1 - labelIn) * 30}px)`,
								display: 'flex',
								alignItems: 'center',
								gap: 22,
							}}
						>
							SAIBA MAIS
							<svg width={56} height={56} viewBox="0 0 56 56">
								<path d="M 8 28 H 46 M 30 12 L 46 28 L 30 44" fill="none" stroke={BRAND.colors.text} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
					) : null}
				</MorphBox>
			) : null}
		</>
	);
};
