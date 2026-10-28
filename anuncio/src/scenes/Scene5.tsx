import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, CLIPS, CUE} from '../config';
import {easeInOut, life, prog, pulse} from '../lib/anim';
import {FileCard, MorphBox, lerpRect, Rect} from '../components/FileCard';
import {CAN_CENTER, CAN_DISC_RADIUS, SodaCan3D} from '../components/SodaCan3D';
import {TitleCard, Words} from '../components/Title';

// Cena 5 — o preço de uma coca (comparação gravada; sem preço numérico).
export const Scene5: React.FC = () => {
	const f = useCurrentFrame();
	const {preço, coca, flatten} = CUE.s5;
	const end = CLIPS[4].start + CLIPS[4].dur;
	if (f < preço - 4 || f >= end + 12) return null;

	const p = pulse(f, coca + 2, 10);
	const disc: Rect = {x: CAN_CENTER.x - CAN_DISC_RADIUS, y: CAN_CENTER.y - CAN_DISC_RADIUS, w: CAN_DISC_RADIUS * 2, h: CAN_DISC_RADIUS * 2, r: CAN_DISC_RADIUS};
	const card: Rect = {x: CAN_CENTER.x - 78, y: CAN_CENTER.y - 100, w: 156, h: 200, r: 14};
	const gone: Rect = {x: CAN_CENTER.x - 20, y: CAN_CENTER.y - 120, w: 40, h: 52, r: 6};
	const discOn = flatten + 7;
	const toCard = prog(f, discOn, 10, easeInOut);
	const out = prog(f, end - 2, 12, easeInOut);
	const rect = out > 0 ? lerpRect(card, gone, out) : lerpRect(disc, card, toCard);

	return (
		<>
			<TitleCard start={preço - 3} end={flatten + 10} top={236} left={96} right={420} align="left" padding="22px 64px 26px 34px">
				<Words text="PREÇO DE" start={preço - 1} size={84} align="left" />
				<div style={{transform: `scale(${1 + 0.14 * p})`, transformOrigin: '0% 60%'}}>
					<Words text="UMA COCA" start={coca - 2} size={102} align="left" emphasis={{COCA: {color: BRAND.colors.laser}}} />
				</div>
			</TitleCard>
			{/* preço confirmado na página do catálogo (“Cada projeto sai por R$ 8,99”) */}
			{f >= coca + 6 && f < flatten + 10 ? (
				<div style={{position: 'absolute', left: 96, top: 498, opacity: life(f, coca + 6, flatten + 10, 8, 6), transform: `translateY(${(1 - prog(f, coca + 6, 9)) * 18}px)`}}>
					<div style={{display: 'inline-flex', alignItems: 'baseline', gap: 12, padding: '12px 28px 15px', borderRadius: 999, background: BRAND.colors.red, color: BRAND.colors.text, boxShadow: '0 14px 30px rgba(226,35,26,0.35)'}}>
						<span style={{fontFamily: BRAND.fonts.title, fontWeight: 800, fontSize: 50, letterSpacing: '-0.01em'}}>R$ 8,99</span>
						<span style={{fontFamily: BRAND.fonts.ui, fontWeight: 600, fontSize: 30}}>por modelo</span>
					</div>
				</div>
			) : null}
			<SodaCan3D enter={preço + 2} coca={coca} flatten={flatten + 2} />
			{f >= discOn ? (
				<div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
					<MorphBox rect={rect} color={BRAND.colors.red} style={{opacity: 1 - prog(f, discOn + 4, 6)}} />
					<div style={{position: 'absolute', left: rect.x, top: rect.y, opacity: prog(f, discOn + 4, 6)}}>
						<FileCard w={rect.w} h={rect.h} style={{filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.3))'}} />
					</div>
				</div>
			) : null}
		</>
	);
};
