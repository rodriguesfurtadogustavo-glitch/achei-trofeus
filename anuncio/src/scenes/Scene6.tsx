import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {useCurrentFrame} from 'remotion';
import {BRAND, CLIPS, CUE} from '../config';
import {easeIn, easeInOut, easeOut, prog} from '../lib/anim';
import {CatalogCard} from '../components/CatalogCard';
import {FullFrameSvg, LaserPath} from '../components/Laser';
import {Words} from '../components/Title';

// Cena 6 — da nossa história para a sua.
const L2 = 76;
const m = (t: string, size: number) => measureText({text: t, fontFamily: 'Bricolage Grotesque', fontWeight: '800', fontSize: size, letterSpacing: '-0.02em'}).width;

const SIDE = [
	{src: 'catalog/futebol.webp', x: -70, y: 930, w: 190, speed: 0.55, z: 1},
	{src: 'catalog/tenis.webp', x: 935, y: 960, w: 190, speed: -0.6, z: 1},
	{src: 'catalog/copa.webp', x: 34, y: 1185, w: 140, speed: 0.3, z: 0.6},
	{src: 'catalog/queimada.webp', x: 930, y: 1215, w: 140, speed: -0.35, z: 0.6},
];

export const Scene6: React.FC = () => {
	const f = useCurrentFrame();
	const {modelos, nossa, sua, out} = CUE.s6;
	const start = CLIPS[5].start;
	if (f < modelos - 2 || f >= out + 2) return null;

	const enter = prog(f, modelos - 2, 9);
	const exit = prog(f, out - 6, 6, easeIn);
	const top = 236;
	const cardH = 300;
	const line2Y = top + 170;

	const oldW = m('DA NOSSA HISTÓRIA', L2);
	const newW = m('PARA A SUA', L2);
	const nossaX = 540 - oldW / 2 + m('DA ', L2) + m('NOSSA', L2) / 2;
	const suaX = 540 + newW / 2 - m('SUA', L2) / 2;
	const oldOut = prog(f, sua - 4, 7, easeIn);
	const link = prog(f, sua - 8, 12, easeInOut);
	const underY = line2Y + L2 + 10;

	return (
		<>
			{SIDE.map((c, i) => {
				const t = prog(f, start + 8 + i * 5, 14, easeOut);
				const drift = (f - start) * c.speed;
				return (
					<div key={c.src} style={{position: 'absolute', left: c.x + drift + (c.speed > 0 ? -1 : 1) * (1 - t) * 120, top: c.y, opacity: t * (1 - exit) * (0.65 + 0.35 * c.z)}}>
						<CatalogCard src={c.src} w={c.w} h={c.w * 1.3} />
					</div>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: 96,
					right: 96,
					top,
					height: cardH,
					borderRadius: 30,
					background: 'rgba(11,11,12,0.93)',
					transform: `translateY(${(1 - enter) * 26 - exit * 30}px) scale(${0.9 + 0.1 * enter})`,
					clipPath: `inset(0 ${(1 - enter) * 100}% 0 0 round 30px)`,
					opacity: 1 - exit,
				}}
			/>
			<div style={{position: 'absolute', left: 0, right: 0, top: top + 30, display: 'flex', justifyContent: 'center', opacity: 1 - exit}}>
				<Words text="MODELOS" start={modelos} size={124} />
			</div>
			<div style={{position: 'absolute', left: 96, right: 96, top: line2Y, height: L2 * 1.1, overflow: 'hidden', opacity: 1 - exit}}>
				{f >= nossa - 2 && oldOut < 1 ? (
					<div style={{display: 'flex', justifyContent: 'center', transform: `translateX(${-oldOut * 120}px)`, opacity: 1 - oldOut}}>
						<Words text="DA NOSSA HISTÓRIA" start={nossa} size={L2} emphasis={{NOSSA: {color: BRAND.colors.laser}}} />
					</div>
				) : null}
				{f >= sua ? (
					<div style={{display: 'flex', justifyContent: 'center'}}>
						<Words text="PARA A SUA" start={sua} size={L2} emphasis={{SUA: {color: BRAND.colors.laser}}} />
					</div>
				) : null}
			</div>
			{f >= sua - 8 ? (
				<div style={{position: 'absolute', inset: 0, opacity: 1 - exit}}>
					<FullFrameSvg>
						<LaserPath d={`M ${nossaX} ${underY} C ${nossaX + 80} ${underY + 46}, ${suaX - 80} ${underY + 46}, ${suaX} ${underY}`} progress={link} width={6} />
					</FullFrameSvg>
				</div>
			) : null}
		</>
	);
};
