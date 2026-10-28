import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, END_CARD_FRAMES, END_CARD_START} from '../config';
import {easeInOut, easeOut, prog} from '../lib/anim';
import {FullFrameSvg, LaserPath} from './Laser';
import {LogoMark, Wordmark} from './Logo';

/** Cartela final (2 s): marca do site, chamada e endereço inteiro numa linha. */
export const EndCard: React.FC = () => {
	const f = useCurrentFrame();
	const s = END_CARD_START;
	if (f < s) return null;
	const approach = 1 + 0.035 * prog(f, s, END_CARD_FRAMES, easeInOut);
	const wipe = prog(f, s, 9, easeInOut);
	const edge = wipe * 1920;
	const mark = prog(f, s + 3, 14, easeOut);
	const word = prog(f, s + 8, 10, easeOut);
	const line = prog(f, s + 12, 12, easeOut);
	const sub = prog(f, s + 16, 9);
	const url = prog(f, s + 20, 10);
	return (
		<AbsoluteFill style={{backgroundColor: BRAND.colors.red}}>
			<AbsoluteFill style={{clipPath: `inset(0 0 ${1920 - edge}px 0)`}}>
				<AbsoluteFill style={{backgroundColor: BRAND.colors.bg}} />
				<AbsoluteFill style={{background: 'radial-gradient(70% 38% at 50% 46%, rgba(226,35,26,0.22), rgba(11,11,12,0) 70%)'}} />
				<AbsoluteFill style={{transform: `scale(${approach})`, alignItems: 'center', justifyContent: 'center'}}>
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -30}}>
						<div style={{transform: `scale(${0.85 + 0.15 * mark})`, opacity: Math.min(1, mark * 2)}}>
							<LogoMark size={176} draw={mark} />
						</div>
						<div style={{height: 46}} />
						<div style={{opacity: word, transform: `translateY(${(1 - word) * 24}px)`}}>
							<Wordmark size={112} />
						</div>
						<div style={{height: 96}} />
						<div style={{fontFamily: BRAND.fonts.ui, fontWeight: 700, fontSize: 42, letterSpacing: '0.16em', color: BRAND.colors.text, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`}}>
							CONHEÇA OS MODELOS
						</div>
						<div style={{height: 30}} />
						<div
							style={{
								padding: '20px 42px 24px',
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
						<LaserPath d="M 230 1048 L 850 1048" progress={line} width={7} />
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
