import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, CUE} from '../config';
import {easeIn, easeOut, prog} from '../lib/anim';
import {FileCard} from '../components/FileCard';
import {FullFrameSvg, LaserPath} from '../components/Laser';
import {TitleCard, Words} from '../components/Title';
import {ModelDrawing} from '../components/ModelDrawing';

// Cena 3 — deixar claro o que está sendo comprado.

/** Cartão-título “NO SEU NEGÓCIO”: tamanho fixo, porque ele se alonga no painel da cena 4. */
export const NEGOCIO_CARD = {x: 210, y: 236, w: 660, h: 296, r: 30};

const FileToDrawing: React.FC = () => {
	const f = useCurrentFrame();
	const s = CUE.s3.arquivos - 2;
	const e = CUE.s3.seuNegócio;
	if (f < s || f >= e) return null;
	const t = prog(f, s, 10);
	const out = prog(f, e - 6, 6, easeIn);
	const line = prog(f, s + 6, 12, easeOut);
	const draw = prog(f, s + 12, 18, easeOut);
	const card = {x: 140, y: 250, w: 220, h: 280};
	const box = {x: 690, y: 226, w: 250, h: 330};
	return (
		<div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${-out * 24}px)`}}>
			<div style={{position: 'absolute', left: card.x, top: card.y, transform: `translateY(${(1 - t) * 40}px) rotate(${(1 - t) * -8}deg)`, opacity: t}}>
				<FileCard w={card.w} h={card.h} style={{filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.3))'}} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: box.x,
					top: box.y,
					width: box.w,
					height: box.h,
					borderRadius: 24,
					background: 'rgba(11,11,12,0.93)',
					opacity: prog(f, s + 8, 8),
					transform: `scale(${0.9 + 0.1 * prog(f, s + 8, 8)})`,
				}}
			/>
			<div style={{position: 'absolute', inset: 0, opacity: prog(f, s + 8, 8)}}>
				<ModelDrawing place={{cx: box.x + box.w / 2, top: box.y + 22, height: box.h - 44}} draw={draw} discText={0} strokeWidth={2.2} />
			</div>
			<FullFrameSvg>
				<LaserPath d={`M ${card.x + card.w + 14} ${card.y + card.h * 0.42} C ${560} ${card.y + 40}, ${600} ${box.y + box.h * 0.75}, ${box.x - 10} ${box.y + box.h * 0.5}`} progress={line} width={6} />
			</FullFrameSvg>
		</div>
	);
};

export const Scene3: React.FC = () => {
	const f = useCurrentFrame();
	const {agora, arquivos, seuNegócio, toPanel} = CUE.s3;
	return (
		<>
			<TitleCard start={agora - 2} end={arquivos - 1} top={236}>
				<Words text="ARQUIVOS" start={agora} size={118} />
				<Words text="DIGITAIS" start={agora + 4} size={118} color={BRAND.colors.laser} />
			</TitleCard>
			<FileToDrawing />
			{f >= seuNegócio - 2 && f < toPanel + 2 ? (
				<div
					style={{
						position: 'absolute',
						left: NEGOCIO_CARD.x,
						top: NEGOCIO_CARD.y,
						width: NEGOCIO_CARD.w,
						height: NEGOCIO_CARD.h,
						borderRadius: NEGOCIO_CARD.r,
						background: 'rgba(11,11,12,0.93)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						transform: `translateY(${(1 - prog(f, seuNegócio - 2, 8)) * 30}px) scale(${0.9 + 0.1 * prog(f, seuNegócio - 2, 8)})`,
						clipPath: `inset(0 ${(1 - prog(f, seuNegócio - 2, 8)) * 100}% 0 0 round ${NEGOCIO_CARD.r}px)`,
						opacity: 1 - prog(f, toPanel - 2, 4),
					}}
				>
					<Words text="NO SEU" start={seuNegócio} size={96} />
					<Words text="NEGÓCIO" start={seuNegócio + 3} size={128} color={BRAND.colors.laser} />
				</div>
			) : null}
		</>
	);
};
