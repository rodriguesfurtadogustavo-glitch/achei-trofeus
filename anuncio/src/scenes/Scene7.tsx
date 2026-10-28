import React from 'react';
import {AbsoluteFill, interpolateColors, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, CUE, END_CARD_START} from '../config';
import {easeIn, easeInOut, easeOut, mix, prog, pulse} from '../lib/anim';
import {MorphBox, lerpRect, Rect} from '../components/FileCard';
import {TitleCard, Words} from '../components/Title';

// Cena 7 — converter a atenção em visita.

/** Gravação real da página do catálogo (acheiarquivos.com.br), trecho 3,4–8,0 s acelerado 2×. */
const SITE_CLIP = 'site/catalogo.mp4';
const SITE_FRAMES = 69;
const SCREEN = {w: 468, h: 954};
const BEZEL = 13;
const PHONE: Rect = {x: 540 - (SCREEN.w + BEZEL * 2) / 2, y: 562, w: SCREEN.w + BEZEL * 2, h: SCREEN.h + BEZEL * 2, r: 66};
/** “Saiba Mais” na parte de baixo do quadro (centro em y ≈ 1427, dentro da área segura). */
export const BUTTON: Rect = {x: 170, y: 1352, w: 740, h: 150, r: 75};
const FULL: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0};

export const Scene7: React.FC = () => {
	const f = useCurrentFrame();
	const {conheça, saiba, pulse: pulseAt, toEnd} = CUE.s7;
	if (f < conheça - 2 || f >= END_CARD_START + 2) return null;

	const phoneStart = conheça + 2;
	const backdrop = prog(f, conheça, 7) * (1 - prog(f, saiba - 6, 8, easeIn));
	const enter = prog(f, phoneStart, 14, easeOut);
	const morph = prog(f, saiba - 8, 10, easeInOut);
	const toFull = prog(f, toEnd, 10, easeInOut);
	const tilt = (1 - morph) * (1 - enter) * 14;
	const turn = (1 - morph) * mix(-10, 3, prog(f, phoneStart, saiba - phoneStart, easeInOut));
	const screenOpacity = 1 - prog(f, saiba - 9, 5);

	let rect = lerpRect(PHONE, BUTTON, morph);
	if (f >= toEnd) rect = lerpRect(BUTTON, FULL, toFull);
	const color = interpolateColors(morph, [0, 1], ['#0D0D0F', BRAND.colors.red]);
	const p = pulse(f, pulseAt, 12);
	const labelIn = prog(f, saiba - 1, 8, easeOut);
	const y = (1 - enter) * 700;

	return (
		<>
			{/* fundo: a apresentadora desfocada enquanto o site aparece */}
			{backdrop > 0 ? <AbsoluteFill style={{backdropFilter: `blur(${22 * backdrop}px)`, background: `rgba(11,11,12,${0.55 * backdrop})`}} /> : null}

			<TitleCard start={conheça - 2} end={saiba - 2} top={236}>
				<Words text="CONHEÇA" start={conheça} size={112} />
				<Words text="OS MODELOS" start={conheça + 4} size={112} emphasis={{MODELOS: {color: BRAND.colors.laser}}} />
			</TitleCard>

			{/* celular com a página real do catálogo → vira o botão “Saiba Mais” */}
			<div style={{position: 'absolute', inset: 0, perspective: 1600, perspectiveOrigin: `540px ${PHONE.y + PHONE.h / 2}px`}}>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						transform: `translateY(${y}px) rotateX(${tilt}deg) rotateY(${turn}deg) scale(${1 + 0.06 * p})`,
						transformOrigin: `540px ${rect.y + rect.h / 2}px`,
					}}
				>
					<MorphBox
						rect={rect}
						color={color}
						style={{
							boxShadow: f < toEnd ? (morph < 1 ? '0 40px 90px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(245,242,237,0.14)' : `0 20px 50px rgba(226,35,26,${0.35 + 0.3 * p})`) : undefined,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{screenOpacity > 0 ? (
							<div style={{position: 'absolute', left: BEZEL, top: BEZEL, width: rect.w - BEZEL * 2, height: rect.h - BEZEL * 2, borderRadius: Math.max(0, rect.r - BEZEL), overflow: 'hidden', opacity: screenOpacity, background: '#F4EFE8'}}>
								<Sequence from={phoneStart} durationInFrames={SITE_FRAMES} layout="none">
									<OffthreadVideo src={staticFile(SITE_CLIP)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
								</Sequence>
								{/* ilha da câmera */}
								<div style={{position: 'absolute', top: 10, left: '50%', width: 104, height: 30, marginLeft: -52, borderRadius: 15, background: '#0D0D0F'}} />
							</div>
						) : null}
						{morph > 0.6 && f < toEnd + 4 ? (
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
				</div>
			</div>
		</>
	);
};
