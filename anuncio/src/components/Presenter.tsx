import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, CAMERA_SHIFT, CAMERA_ZOOM, CLIPS, HEIGHT, WIDTH} from '../config';
import {keyframes} from '../lib/anim';

/**
 * Vídeo da apresentadora: os sete takes em sequência (cortes secos, sem sobreposição),
 * com reenquadramento digital moderado ancorado no rosto. Áudio vem de voice.wav.
 */
const ClipView: React.FC<{index: number}> = ({index}) => {
	const f = useCurrentFrame();
	const clip = CLIPS[index];
	const scale = keyframes(f, CAMERA_ZOOM[index]);
	return (
		<AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: `${clip.face.x}px ${clip.face.y}px`}}>
			<OffthreadVideo
				src={staticFile(clip.file)}
				trimBefore={clip.in}
				muted
				style={{width: WIDTH, height: HEIGHT, objectFit: 'cover'}}
			/>
		</AbsoluteFill>
	);
};

export const Presenter: React.FC = () => {
	const f = useCurrentFrame();
	const shift = keyframes(f, CAMERA_SHIFT);
	return (
		<AbsoluteFill style={{backgroundColor: BRAND.colors.bg}}>
			<AbsoluteFill style={{transform: `translateY(${shift}px)`}}>
				{CLIPS.map((clip, i) => (
					<Sequence key={clip.file} from={clip.start} durationInFrames={clip.dur} layout="none">
						<ClipView index={i} />
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
