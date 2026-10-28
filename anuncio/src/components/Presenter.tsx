import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, CAMERA_ZOOM, CLIPS, DEMO_AMOUNT, DEMO_FRAMING, FRAMING, HEIGHT, SEGMENTS, WIDE, WIDTH} from '../config';
import {easeInOut, keyframes, mix, prog} from '../lib/anim';

/** 0 = quadro aberto (original), 1 = fechado no rosto. */
export const tightness = (f: number) => {
	let wide = 0;
	for (const [a, b] of WIDE) {
		const opening = a <= 0 ? 1 : prog(f, a, FRAMING.ease, easeInOut);
		wide = Math.max(wide, Math.min(opening, 1 - prog(f, b, FRAMING.ease, easeInOut)));
	}
	return 1 - wide;
};

/**
 * Um trecho de um take. Reenquadramento digital ancorado no rosto: no quadro fechado o rosto vai
 * para (540, tightFaceY) e cresce `tightScale`; na tela dividida da demonstração vai para
 * (540, DEMO_FRAMING.faceY) com escala que cobre o quadro todo; nos jump cuts, o zoom muda um pouco.
 */
const SegmentView: React.FC<{seg: (typeof SEGMENTS)[number]}> = ({seg}) => {
	const local = useCurrentFrame();
	const f = seg.start + local;
	const clip = CLIPS[seg.take];
	const {x: fx, y: fy} = clip.face;
	const tg = tightness(f);
	const demo = keyframes(f, DEMO_AMOUNT);
	const slow = keyframes(f - clip.start, CAMERA_ZOOM[seg.take]);
	const punch = seg.index % 2 === 1 ? mix(1.05, FRAMING.punch, tg) : 1;
	const s = slow * mix(mix(1, FRAMING.tightScale, tg), DEMO_FRAMING.scale, demo) * punch;
	const tx = mix(mix(0, 540 - fx, tg), 540 - fx, demo);
	const ty = mix(mix(0, FRAMING.tightFaceY - fy, tg), DEMO_FRAMING.faceY - fy, demo);
	return (
		<AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: `${fx}px ${fy}px`}}>
			<OffthreadVideo src={staticFile(clip.file)} trimBefore={seg.in} muted style={{width: WIDTH, height: HEIGHT, objectFit: 'cover'}} />
		</AbsoluteFill>
	);
};

export const Presenter: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: BRAND.colors.bg}}>
			<AbsoluteFill>
				{SEGMENTS.map((seg) => (
					<Sequence key={`${seg.take}-${seg.index}`} from={seg.start} durationInFrames={seg.dur} layout="none">
						<SegmentView seg={seg} />
					</Sequence>
				))}
			</AbsoluteFill>
			{/* leve escurecimento na base para a leitura das legendas */}
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(11,11,12,0) 62%, rgba(11,11,12,0.35) 80%, rgba(11,11,12,0.55) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
