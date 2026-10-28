import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, CLIPS, CUE} from '../config';
import {easeIn, easeInOut, easeOut, mix, prog} from '../lib/anim';
import {CatalogCard} from '../components/CatalogCard';
import {FullFrameSvg, LaserPath} from '../components/Laser';
import {FileCard, MorphBox, lerpRect, Rect} from '../components/FileCard';
import {Words} from '../components/Title';

// Cena 2 — apresentação da fundadora e da coleção.

const LowerThird: React.FC = () => {
	const f = useCurrentFrame();
	const {lowerThird: s, lowerThirdOut: e} = CUE.s2;
	if (f < s || f >= e) return null;
	const t = prog(f, s, 10);
	const out = prog(f, e - 6, 6, easeIn);
	const bar = prog(f, s, 8);
	return (
		<div style={{position: 'absolute', left: 96, top: 1168, opacity: 1 - out, transform: `translateX(${-out * 40}px)`}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 18,
					padding: '16px 28px 18px 22px',
					borderRadius: 18,
					background: 'rgba(11,11,12,0.88)',
					clipPath: `inset(0 ${(1 - t) * 100}% 0 0 round 18px)`,
				}}
			>
				<div style={{width: 6, height: 70 * bar, borderRadius: 3, background: BRAND.colors.laser, boxShadow: `0 0 14px ${BRAND.colors.laser}`}} />
				<div>
					<div style={{fontFamily: BRAND.fonts.title, fontWeight: 800, fontSize: 50, color: BRAND.colors.text, lineHeight: 1}}>{BRAND.presenter}</div>
					<div style={{fontFamily: BRAND.fonts.ui, fontWeight: 600, fontSize: 30, color: BRAND.colors.text, opacity: 0.82, marginTop: 6}}>
						{BRAND.presenterRole}
					</div>
				</div>
			</div>
		</div>
	);
};

const PANEL: Rect = {x: 36, y: 150, w: 1008, h: 1180, r: 34};
const CARDS = [
	{src: 'catalog/copa.webp', x: -340, z: -140, y: 30, rot: 10},
	{src: 'catalog/judo.webp', x: 0, z: 90, y: -10, rot: 0},
	{src: 'catalog/roxo.webp', x: 340, z: -60, y: 40, rot: -10},
];
const CARD_W = 310;
const CARD_H = 420;
const CARD_TOP = 600;

export const CollectionInsert: React.FC = () => {
	const f = useCurrentFrame();
	const {coleção, disposição, cover} = CUE.s2;
	const start = coleção - 6;
	if (f < start || f >= cover + 12) return null;

	const wipe = prog(f, start, 10, easeInOut);
	const camT = prog(f, coleção, cover - coleção, easeInOut);
	const camY = mix(-16, 6, camT);
	const camX = mix(60, -40, camT);
	const organize = prog(f, disposição, 12, easeInOut);
	const panelBottom = PANEL.y + PANEL.h * wipe;

	return (
		<>
			<div style={{position: 'absolute', inset: 0, clipPath: `inset(${PANEL.y}px 0 ${1920 - panelBottom}px 0)`}}>
				<MorphBox rect={PANEL} color={BRAND.colors.bg} style={{boxShadow: '0 30px 80px rgba(0,0,0,0.4)'}}>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: `radial-gradient(70% 45% at 50% 52%, rgba(226,35,26,0.18), rgba(11,11,12,0) 70%)`,
						}}
					/>
				</MorphBox>
				{/* câmera lateral sobre os cartões com profundidade */}
				<div style={{position: 'absolute', inset: 0, perspective: 1500, perspectiveOrigin: '540px 820px'}}>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							transformStyle: 'preserve-3d',
							transform: `translateX(${camX}px) rotateY(${camY * (1 - organize * 0.7)}deg)`,
							transformOrigin: '540px 820px',
						}}
					>
						{CARDS.map((c, i) => {
							const t = prog(f, coleção + i * 4, 14, easeOut);
							const x = 540 - CARD_W / 2 + c.x;
							const y = CARD_TOP + mix(c.y, 0, organize) + (1 - t) * 260;
							const z = mix(c.z, 0, organize);
							const rot = mix(c.rot, 0, organize);
							const isHero = i === 1;
							return (
								<div
									key={c.src}
									style={{
										position: 'absolute',
										left: x,
										top: y,
										transform: `translateZ(${z}px) rotateY(${rot}deg) scale(${isHero ? 1 + 0.06 * organize : 1})`,
										opacity: t * (isHero ? 1 : 1 - prog(f, cover, 6)),
									}}
								>
									<CatalogCard src={c.src} w={CARD_W} h={CARD_H} glow={isHero ? organize : 0} />
								</div>
							);
						})}
					</div>
				</div>
				<div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 1 - prog(f, cover, 5)}}>
					{f >= disposição ? (
						<div>
							<Words text="À SUA" start={disposição} size={96} />
							<Words text="DISPOSIÇÃO" start={disposição + 3} size={118} color={BRAND.colors.laser} />
						</div>
					) : null}
				</div>
			</div>
			{/* linha de laser na borda da revelação */}
			{wipe < 1 ? (
				<FullFrameSvg>
					<LaserPath d={`M ${PANEL.x} ${panelBottom} L ${PANEL.x + PANEL.w} ${panelBottom}`} progress={1} width={6} head={false} />
				</FullFrameSvg>
			) : null}
		</>
	);
};

/**
 * Ponte cena 2 → 3: o cartão central cresce até cobrir o quadro (esconde o corte),
 * depois se recolhe no ícone de arquivo `.CDR`, que sai pelo canto.
 */
export const CollectionToFile: React.FC = () => {
	const f = useCurrentFrame();
	const {cover} = CUE.s2;
	const cut = CLIPS[2].start;
	const end = CUE.s3.reveal + 18;
	if (f < cover || f >= end) return null;

	const heroScale = 1.06;
	const hero: Rect = {
		x: 540 - (CARD_W * heroScale) / 2 - 40, // -40 = deslocamento final da câmera lateral
		y: CARD_TOP - (CARD_H * (heroScale - 1)) / 2,
		w: CARD_W * heroScale,
		h: CARD_H * heroScale,
		r: CARD_W * 0.09,
	};
	const full: Rect = {x: -20, y: -20, w: 1120, h: 1960, r: 0};
	const file: Rect = {x: 540 - 140, y: 228, w: 280, h: 350, r: 24}; // faixa de cima: rosto livre
	const corner: Rect = {x: 860, y: 236, w: 110, h: 138, r: 10};

	const grow = prog(f, cover, 10, easeInOut);
	const shrink = prog(f, cut + 1, 10, easeInOut);
	const away = prog(f, CUE.s3.reveal + 4, 12, easeInOut);
	let rect = lerpRect(hero, full, grow);
	if (f >= cut + 1) rect = lerpRect(full, file, shrink);
	if (f >= CUE.s3.reveal + 4) rect = lerpRect(file, corner, away);

	const fileOpacity = prog(f, cut + 6, 5);
	const boxOpacity = 1 - fileOpacity;
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - prog(f, end - 6, 6)}}>
			<MorphBox rect={rect} color={BRAND.colors.surface} style={{opacity: boxOpacity}} />
			{fileOpacity > 0 ? (
				<div style={{position: 'absolute', left: rect.x, top: rect.y, opacity: fileOpacity}}>
					<FileCard w={rect.w} h={rect.h} style={{filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.35))'}} />
				</div>
			) : null}
		</div>
	);
};

export const Scene2: React.FC = () => (
	<>
		<LowerThird />
		<CollectionInsert />
	</>
);
