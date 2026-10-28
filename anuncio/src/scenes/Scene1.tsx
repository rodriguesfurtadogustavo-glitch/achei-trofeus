import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {useCurrentFrame} from 'remotion';
import {BRAND, CUE} from '../config';
import {easeIn, easeOut, mix, prog, settle} from '../lib/anim';
import {FullFrameSvg, LaserPath} from '../components/Laser';

// Cena 1 — identificar o público no primeiro segundo.
const L1 = 92;
const L2 = 136;
const PAD_X = 44;
const TOP = 232;
const H = 44 + L1 + L2 + 62;

const width = (a: string, b: string) => {
	const m1 = measureText({text: a, fontFamily: 'Bricolage Grotesque', fontWeight: '800', fontSize: L1, letterSpacing: '-0.02em'}).width;
	const m2 = measureText({text: b, fontFamily: 'Bricolage Grotesque', fontWeight: '800', fontSize: L2, letterSpacing: '-0.02em'}).width;
	return {card: Math.max(m1, m2) + PAD_X * 2, line2: m2};
};

const Line: React.FC<{text: string; size: number; t: number; out: number; color?: string; delay?: number}> = ({text, size, t, out, color = BRAND.colors.text}) => (
	<div style={{height: size * 1.02, overflow: 'hidden'}}>
		<div
			style={{
				fontFamily: BRAND.fonts.title,
				fontWeight: 800,
				fontSize: size,
				lineHeight: 1.02,
				letterSpacing: '-0.02em',
				color,
				whiteSpace: 'nowrap',
				transform: `translateY(${(1 - t) * 100 - out * 100}%)`,
			}}
		>
			{text}
		</div>
	</div>
);

export const Scene1: React.FC = () => {
	const f = useCurrentFrame();
	const {title, troféus, querComeçar, recado} = CUE.s1;
	const end = recado + 12;
	if (f < title || f >= end + 2) return null;

	const A = width('JÁ VENDE', 'TROFÉUS?');
	const B = width('OU QUER', 'COMEÇAR?');
	const swap = settle(f, querComeçar - 1, 14);
	const cardW = mix(A.card, B.card, Math.min(1.08, swap));
	const lineW = mix(A.line2, B.line2, Math.min(1, swap));

	const enter = prog(f, title, 9);
	const exit = prog(f, end - 6, 6, easeIn);
	const cardH = H + 30 * Math.sin(Math.PI * Math.min(1, prog(f, querComeçar - 1, 10)));

	const aOut = prog(f, querComeçar - 1, 6, easeIn);
	const bIn = prog(f, querComeçar + 2, 9, easeOut);
	const underline = prog(f, troféus, 11, easeOut);

	const x0 = 540 - cardW / 2;
	const lineY = TOP + 22 + L1 * 1.02 + L2 * 1.02 + 8;

	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: x0,
					top: TOP,
					width: cardW,
					height: cardH,
					borderRadius: 30,
					background: 'rgba(11,11,12,0.93)',
					boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
					transform: `translateY(${(1 - enter) * 30 - exit * 26}px) scale(${0.88 + 0.12 * enter})`,
					opacity: 1 - exit,
					clipPath: `inset(0 ${(1 - enter) * 100}% 0 0 round 30px)`,
				}}
			>
				<div style={{position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					{aOut < 1 ? (
						<>
							<Line text="JÁ VENDE" size={L1} t={prog(f, title + 1, 9)} out={aOut} />
							<Line text="TROFÉUS?" size={L2} t={prog(f, title + 4, 9)} out={aOut} />
						</>
					) : (
						<>
							<Line text="OU QUER" size={L1} t={bIn} out={0} />
							<Line text="COMEÇAR?" size={L2} t={prog(f, querComeçar + 4, 9)} out={0} color={BRAND.colors.laser} />
						</>
					)}
				</div>
			</div>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `translateY(${-exit * 26}px)`}}>
				<FullFrameSvg>
					<LaserPath d={`M ${540 - lineW / 2} ${lineY} L ${540 + lineW / 2} ${lineY}`} progress={underline} width={8} />
				</FullFrameSvg>
			</div>
		</>
	);
};
