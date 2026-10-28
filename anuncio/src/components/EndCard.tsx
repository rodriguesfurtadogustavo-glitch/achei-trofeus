import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, END_CARD_FRAMES, END_CARD_START} from '../config';
import {easeInOut, easeOut, prog} from '../lib/anim';
import {FullFrameSvg, LaserPath} from './Laser';
import {Words} from './Title';

/** Cartela final (2 s): nome, chamada e endereço inteiro numa linha. */
export const EndCard: React.FC = () => {
	const f = useCurrentFrame();
	const s = END_CARD_START;
	if (f < s) return null;
	const approach = 1 + 0.035 * prog(f, s, END_CARD_FRAMES, easeInOut);
	const line = prog(f, s + 6, 12, easeOut);
	const sub = prog(f, s + 12, 9);
	const url = prog(f, s + 16, 10);
	const wipe = prog(f, s, 9, easeInOut);
	const edge = wipe * 1920;
	return (
		<AbsoluteFill style={{backgroundColor: BRAND.colors.red}}>
			<AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - edge}px 0)`}}>
			<AbsoluteFill style={{backgroundColor: BRAND.colors.bg}} />
			<AbsoluteFill style={{background: 'radial-gradient(70% 38% at 50% 50%, rgba(226,35,26,0.2), rgba(11,11,12,0) 70%)'}} />
			<AbsoluteFill style={{transform: `scale(${approach})`, alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -40}}>
					<Words text="ACHEI" start={s + 1} size={164} lineHeight={0.95} />
					<Words text="ARQUIVOS" start={s + 4} size={164} lineHeight={0.95} color={BRAND.colors.laser} />
					<div style={{height: 70}} />
					<div
						style={{
							fontFamily: BRAND.fonts.ui,
							fontWeight: 700,
							fontSize: 44,
							letterSpacing: '0.14em',
							color: BRAND.colors.text,
							opacity: sub,
							transform: `translateY(${(1 - sub) * 16}px)`,
						}}
					>
						CONHEÇA OS MODELOS
					</div>
					<div style={{height: 34}} />
					<div
						style={{
							padding: '20px 40px 24px',
							borderRadius: 999,
							border: `3px solid ${BRAND.colors.red}`,
							background: 'rgba(226,35,26,0.12)',
							fontFamily: BRAND.fonts.ui,
							fontWeight: 700,
							fontSize: 62,
							letterSpacing: '-0.01em',
							color: BRAND.colors.text,
							whiteSpace: 'nowrap',
							opacity: url,
							transform: `translateY(${(1 - url) * 18}px)`,
						}}
					>
						{BRAND.domain}
					</div>
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${approach})`}}>
				<FullFrameSvg>
					<LaserPath d="M 250 1003 L 830 1003" progress={line} width={7} />
				</FullFrameSvg>
			</div>
			</AbsoluteFill>
			{wipe < 1 ? (
				<FullFrameSvg>
					<LaserPath d={`M 0 ${edge} L 1080 ${edge}`} progress={1} width={7} head={false} />
				</FullFrameSvg>
			) : null}
		</AbsoluteFill>
	);
};
