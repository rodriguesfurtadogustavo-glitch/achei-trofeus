import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BRAND, CUE} from '../config';
import {easeIn, easeInOut, easeOut, mix, prog, pulse} from '../lib/anim';
import {FileCard, MorphBox, lerpRect, Rect} from '../components/FileCard';
import {FullFrameSvg, LaserPath} from '../components/Laser';
import {Words} from '../components/Title';
import {TROPHY_SCREEN, Trophy3D} from '../components/Trophy3D';
import {VectorDrawing} from '../components/VectorDrawing';
import {NEGOCIO_CARD} from './Scene3';

// Cena 4 — demonstração principal: arquivo → edição → peça em MDF.

export const PANEL: Rect = {x: 60, y: 796, w: 960, h: 524, r: 30};
const FULL: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0};
const BAR_H = 56;
const TOOL_W = 64;

const OLD_TEXT = 'NOME DO EVENTO';
const NEW_TEXT = 'COPA DO SEU CLIENTE';
const SUB = '2026';
export const PLAQUE_TEXT: [string, string] = [NEW_TEXT, SUB];

const Toolbar: React.FC<{active: number}> = ({active}) => {
	const icons = [
		'M 0 0 L 0 22 L 6 16 L 10 25 L 14 23 L 10 14 L 18 14 Z', // seleção
		'M 2 20 L 20 2 M 2 20 m -3 -3 h 6 v 6 h -6 Z M 20 2 m -3 -3 h 6 v 6 h -6 Z', // nós
		'M 1 2 H 21 M 11 2 V 24', // texto
		'M 2 2 H 20 V 20 H 2 Z', // retângulo
		'M 11 1 A 10 10 0 1 1 10.99 1 Z', // elipse
	];
	return (
		<svg width={TOOL_W} height={300} viewBox={`0 0 ${TOOL_W} 300`}>
			{icons.map((d, i) => (
				<g key={i} transform={`translate(${(TOOL_W - 22) / 2} ${22 + i * 54})`}>
					{i === active ? <rect x={-10} y={-10} width={42} height={44} rx={10} fill="rgba(226,35,26,0.22)" /> : null}
					<path d={d} fill={i === 0 ? (i === active ? BRAND.colors.laser : BRAND.colors.muted) : 'none'} stroke={i === active ? BRAND.colors.laser : BRAND.colors.muted} strokeWidth={2.4} strokeLinejoin="round" />
				</g>
			))}
		</svg>
	);
};

const Cursor: React.FC<{x: number; y: number; press: number}> = ({x, y, press}) => (
	<svg width={40} height={48} viewBox="0 0 20 24" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.5))'}}>
		<path d="M 1 1 L 1 19 L 6 14.5 L 9.5 22 L 12.8 20.5 L 9.4 13.2 L 16 13.2 Z" fill={BRAND.colors.text} stroke={BRAND.colors.bg} strokeWidth={1.4} strokeLinejoin="round" />
	</svg>
);

export const Scene4: React.FC = () => {
	const f = useCurrentFrame();
	const {toPanel} = CUE.s3;
	const {recebe, abre, edita, sem, zero, porque, mdf, back} = CUE.s4;
	if (f < toPanel || f >= back + 16) return null;

	// ---------- forma do painel: cartão-título → painel → tela cheia
	const toP = prog(f, toPanel, 14, easeInOut);
	const toFull = prog(f, mdf, 10, easeInOut);
	let rect = lerpRect(NEGOCIO_CARD, PANEL, toP);
	if (f >= mdf) rect = lerpRect(PANEL, FULL, toFull);
	const retract = prog(f, back, 12, easeInOut); // painel cheio sai pela base, revelando a apresentadora
	const clipTop = retract * 1920;

	// ---------- desenho
	const canvasX = PANEL.x + TOOL_W;
	const canvasW = PANEL.w - TOOL_W;
	const baseH = 440;
	const baseW = (baseH * 760) / 1330;
	const posA = {left: canvasX + canvasW / 2 - baseW / 2, top: PANEL.y + BAR_H + 14, height: baseH};
	const posB = {left: PANEL.x + PANEL.w - 40 - (420 * 760) / 1330, top: PANEL.y + BAR_H + 24, height: 420};
	const posC = {left: TROPHY_SCREEN.left, top: TROPHY_SCREEN.top, height: TROPHY_SCREEN.height};
	const side = prog(f, sem - 4, 12, easeInOut) * (1 - prog(f, porque, 10, easeInOut));
	const big = prog(f, mdf, 10, easeInOut);
	const pos = {
		left: mix(mix(posA.left, posB.left, side), posC.left, big),
		top: mix(mix(posA.top, posB.top, side), posC.top, big),
		height: mix(mix(posA.height, posB.height, side), posC.height, big),
	};

	const draw = prog(f, recebe + 8, 30, easeOut);
	const nodes = prog(f, abre + 2, 8) * (1 - prog(f, edita + 38, 8));
	const select = prog(f, edita, 6) * (1 - prog(f, edita + 38, 8));
	const delStart = edita + 6;
	const typeStart = edita + 11;
	let text = OLD_TEXT;
	if (f >= delStart) text = OLD_TEXT.slice(0, Math.max(0, OLD_TEXT.length - Math.floor((f - delStart) * 3.5)));
	if (f >= typeStart) text = NEW_TEXT.slice(0, Math.min(NEW_TEXT.length, Math.floor((f - typeStart) / 1.25)));
	const caret = f >= edita + 4 && f < edita + 40 && Math.floor((f - edita) / 6) % 2 === 0;
	const fill = prog(f, porque, 10);
	const start3D = mdf + 10;
	const lineOpacity = 1 - prog(f, start3D, 10);

	// ---------- arquivo recebido
	const fileIn = prog(f, recebe - 8, 10, easeOut);
	const fileOpen = prog(f, recebe + 6, 12, easeInOut);

	// ---------- interface
	const chrome = prog(f, abre - 4, 8) * (1 - prog(f, mdf, 6));
	const label = prog(f, toPanel + 12, 8) * (1 - prog(f, mdf, 6));
	const tool = f >= edita - 2 ? 2 : f >= abre + 6 ? 1 : 0;

	// ---------- cursor
	const cur = {
		x: mix(mix(canvasX + 120, posA.left + baseW * 0.85, prog(f, abre, 14, easeInOut)), posA.left + baseW * 0.58, prog(f, edita - 10, 10, easeInOut)),
		y: mix(mix(PANEL.y + 140, PANEL.y + 220, prog(f, abre, 14, easeInOut)), posA.top + baseH * 0.9, prog(f, edita - 10, 10, easeInOut)),
	};
	const cursorOpacity = prog(f, abre, 6) * (1 - prog(f, edita + 40, 6));

	// ---------- título “SEM COMEÇAR DO ZERO”
	const tIn = prog(f, sem, 8);
	const tOut = prog(f, porque - 4, 6, easeIn);
	const zeroPulse = pulse(f, zero, 12);

	const inPanel = f < mdf;
	return (
		<div style={{position: 'absolute', inset: 0, clipPath: `inset(${clipTop}px 0 0 0)`}}>
			<MorphBox rect={rect} color={BRAND.colors.bg} style={{boxShadow: inPanel ? '0 24px 70px rgba(0,0,0,0.45)' : undefined}}>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `radial-gradient(60% 40% at 50% ${inPanel ? 60 : 52}%, rgba(226,35,26,${inPanel ? 0.1 : 0.2}), rgba(11,11,12,0) 70%)`,
						opacity: prog(f, toPanel + 8, 8),
					}}
				/>
			</MorphBox>

			{/* grade do documento + interface ilustrativa */}
			{f >= toPanel + 8 ? (
				<div
					style={{
						position: 'absolute',
						left: PANEL.x,
						top: PANEL.y,
						width: PANEL.w,
						height: PANEL.h,
						borderRadius: PANEL.r,
						overflow: 'hidden',
						opacity: prog(f, toPanel + 8, 8) * (1 - prog(f, mdf, 6)),
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: TOOL_W * chrome,
							top: BAR_H * chrome,
							right: 0,
							bottom: 0,
							backgroundImage: 'radial-gradient(rgba(245,242,237,0.12) 1.4px, transparent 1.6px)',
							backgroundSize: '28px 28px',
						}}
					/>
					<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: BAR_H, background: BRAND.colors.surface, opacity: chrome, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(245,242,237,0.08)'}}>
						<div style={{marginLeft: TOOL_W + 8, padding: '8px 18px', borderRadius: 10, background: 'rgba(245,242,237,0.06)', fontFamily: BRAND.fonts.ui, fontWeight: 600, fontSize: 24, color: BRAND.colors.text, display: 'flex', gap: 10, alignItems: 'center'}}>
							<span style={{color: BRAND.colors.laser, fontWeight: 800}}>●</span> modelo-judo.cdr
						</div>
					</div>
					<div style={{position: 'absolute', left: 0, top: BAR_H, bottom: 0, width: TOOL_W, background: BRAND.colors.surface, opacity: chrome, borderRight: '1px solid rgba(245,242,237,0.08)', transform: `translateX(${(chrome - 1) * TOOL_W}px)`}}>
						<Toolbar active={tool} />
					</div>
					<div style={{position: 'absolute', right: 18, top: 14, fontFamily: BRAND.fonts.ui, fontWeight: 500, fontSize: 21, color: BRAND.colors.muted, opacity: label, letterSpacing: '0.01em'}}>
						Demonstração ilustrativa
					</div>
				</div>
			) : null}

			{/* arquivo chegando e abrindo */}
			{f >= recebe - 8 && fileOpen < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: canvasX + canvasW / 2 - 80,
						top: PANEL.y + 150 + (1 - fileIn) * -160,
						opacity: fileIn * (1 - fileOpen),
						transform: `scale(${1 + fileOpen * 0.5})`,
					}}
				>
					<FileCard w={160} h={204} style={{filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.5))'}} />
				</div>
			) : null}

			{f >= recebe + 8 ? (
				<VectorDrawing
					left={pos.left}
					top={pos.top}
					height={pos.height}
					draw={draw}
					nodes={nodes}
					select={select}
					text={text}
					sub={SUB}
					caret={caret}
					fill={fill * (1 - prog(f, start3D, 10))}
					lineOpacity={lineOpacity}
				/>
			) : null}

			{cursorOpacity > 0 ? <div style={{opacity: cursorOpacity}}><Cursor x={cur.x} y={cur.y} press={pulse(f, edita - 1, 6)} /></div> : null}

			{/* SEM COMEÇAR DO ZERO */}
			{f >= sem && f < porque + 2 ? (
				<div style={{position: 'absolute', left: PANEL.x + TOOL_W + 34, top: PANEL.y + BAR_H + 104, opacity: 1 - tOut, transform: `translateY(${(1 - tIn) * 20 - tOut * 20}px)`}}>
					<Words text="SEM COMEÇAR" start={sem} size={62} align="left" />
					<div style={{transform: `scale(${1 + 0.12 * zeroPulse})`, transformOrigin: '0% 60%'}}>
						<Words text="DO ZERO" start={sem + 4} size={124} align="left" emphasis={{ZERO: {color: BRAND.colors.laser}}} />
					</div>
				</div>
			) : null}

			{/* peça em MDF (3D) */}
			{f >= start3D ? (
				<div style={{position: 'absolute', inset: 0, transform: `translateY(${retract * 200}px)`}}>
					<Trophy3D start={start3D} plaque={PLAQUE_TEXT} />
				</div>
			) : null}

			{retract > 0 && retract < 1 ? (
				<FullFrameSvg>
					<LaserPath d={`M 0 ${clipTop} L 1080 ${clipTop}`} progress={1} width={6} head={false} />
				</FullFrameSvg>
			) : null}
		</div>
	);
};
