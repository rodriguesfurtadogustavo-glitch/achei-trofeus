import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BRAND, CAPTIONS, CUE} from '../config';
import {prog} from '../lib/anim';

/** Legendas em blocos curtos; a palavra principal recebe a cor de laser. */
export const Captions: React.FC = () => {
	const f = useCurrentFrame();
	// durante o “Saiba Mais” (botão na base) a legenda sobe para o peito
	const y = f >= CUE.s7.saiba - 8 ? 1238 : 1435;
	let active = -1;
	for (let i = 0; i < CAPTIONS.length; i++) {
		if (CAPTIONS[i].from <= f && f < CAPTIONS[i].to) active = i;
	}
	if (active < 0 || CAPTIONS[active].hideInVideo) return null;
	const c = CAPTIONS[active];
	const t = prog(f, c.from, 4);
	const parts = c.hl ? c.text.split(c.hl) : [c.text];
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 96,
					right: 96,
					top: y,
					transform: `translateY(-50%) translateY(${(1 - t) * 10}px)`,
					opacity: t,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						maxWidth: 860,
						padding: '12px 26px 14px',
						borderRadius: 18,
						background: 'rgba(11,11,12,0.66)',
						color: BRAND.colors.text,
						fontFamily: BRAND.fonts.ui,
						fontWeight: 600,
						fontSize: 56,
						lineHeight: 1.18,
						letterSpacing: '-0.01em',
						textAlign: 'center',
						textShadow: '0 2px 12px rgba(0,0,0,0.35)',
					}}
				>
					{parts.map((p, i) => (
						<React.Fragment key={i}>
							{p}
							{i < parts.length - 1 ? <span style={{color: BRAND.colors.laser, fontWeight: 700}}>{c.hl}</span> : null}
						</React.Fragment>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
