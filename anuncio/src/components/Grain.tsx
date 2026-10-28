import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';

/** Grão de filme muito sutil: une a gravação ampliada e os gráficos. Determinístico por frame. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				backgroundImage: `url(${staticFile('ui/grain.png')})`,
				backgroundSize: '270px 270px',
				backgroundPosition: `${(f * 97) % 270}px ${(f * 61) % 270}px`,
				mixBlendMode: 'overlay',
				opacity,
				pointerEvents: 'none',
			}}
		/>
	);
};
