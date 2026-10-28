import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {BRAND, CUE} from '../config';
import {easeIn, easeInOut, easeOut, mix, prog, pulse, settle} from '../lib/anim';
import {DISC, DISC_TEXT, Placement, placementTransform} from '../lib/model';
import {FileCard, MorphBox, lerpRect, Rect} from '../components/FileCard';
import {FullFrameSvg, LaserPath} from '../components/Laser';
import {ModelDrawing} from '../components/ModelDrawing';
import {Words} from '../components/Title';
import {TROPHY_PLACE, Trophy3D} from '../components/Trophy3D';
import {NEGOCIO_CARD} from './Scene3';

// Cena 4 — demonstração principal: arquivo → abre no editor → edição → peça em MDF.

export const PANEL: Rect = {x: 60, y: 796, w: 960, h: 524, r: 30};
const FULL: Rect = {x: 0, y: 0, w: 1080, h: 1920, r: 0};
const BAR_H = 56;
const TOOL_W = 64;
const FILE_NAME = 'modelo-asas.cdr';
const COREL_ICON = 'ui/corel-icon.png';

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

/** Texto do disco durante a edição: apaga o texto provisório e digita o do cliente. */
const discLines = (f: number, start: number) => {
	const before = DISC_TEXT.before.join('\n');
	const after = DISC_TEXT.after.join('\n');
	const delStart = start + 6;
	const typeStart = start + 11;
	if (f < delStart) return {lines: DISC_TEXT.before, muted: true};
	if (f < typeStart) return {lines: before.slice(0, Math.max(0, before.length - Math.floor((f - delStart) * 3.5))).split('\n'), muted: true};
	return {lines: after.slice(0, Math.min(after.length, Math.floor((f - typeStart) / 1.2))).split('\n'), muted: false};
};

const discOnScreen = (p: Placement) => {
	const {s, x0, y0} = placementTransform(p);
	return {x: x0 + DISC.cx * s, y: y0 + DISC.cy * s, r: DISC.r * s};
};

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
	const retract = prog(f, back, 12, easeInOut); // a tela cheia sai por cima, revelando a apresentadora
	const clipTop = retract * 1920;

	// ---------- posições do desenho: no editor → à direita do título → peça em tela cheia
	const canvasX = PANEL.x + TOOL_W;
	const canvasW = PANEL.w - TOOL_W;
	const posA: Placement = {cx: canvasX + canvasW / 2, top: PANEL.y + BAR_H + 18, height: 428};
	const posB: Placement = {cx: PANEL.x + PANEL.w - 150, top: PANEL.y + BAR_H + 26, height: 412};
	const side = prog(f, sem - 4, 12, easeInOut) * (1 - prog(f, porque, 10, easeInOut));
	const big = prog(f, mdf, 10, easeInOut);
	const place: Placement = {
		cx: mix(mix(posA.cx, posB.cx, side), TROPHY_PLACE.cx, big),
		top: mix(mix(posA.top, posB.top, side), TROPHY_PLACE.top, big),
		height: mix(mix(posA.height, posB.height, side), TROPHY_PLACE.height, big),
	};

	// ---------- arquivo chega → ícone do editor abre o arquivo → desenho vetorial
	const iconAt = abre - 8;
	const fileIn = prog(f, recebe - 8, 12, easeOut);
	const fileToIcon = prog(f, iconAt + 2, 9, easeInOut);
	const iconPop = settle(f, iconAt, 11);
	const iconToTab = prog(f, abre + 3, 11, easeInOut);
	const chrome = prog(f, abre + 3, 10) * (1 - prog(f, mdf, 6));
	const label = prog(f, toPanel + 12, 8) * (1 - prog(f, mdf, 6));
	const draw = prog(f, abre + 4, 26, easeOut);
	const nodes = prog(f, abre + 16, 8) * (1 - prog(f, edita + 38, 8));
	const select = prog(f, edita, 6) * (1 - prog(f, edita + 38, 8));
	const {lines, muted} = discLines(f, edita);
	const caret = f >= edita + 4 && f < edita + 40 && Math.floor((f - edita) / 6) % 2 === 0;
	const fill = prog(f, porque, 10);
	const start3D = mdf + 10;
	const show3D = prog(f, start3D, 8);
	const tool = f >= edita - 2 ? 2 : f >= abre + 16 ? 1 : 0;

	const center = {x: canvasX + canvasW / 2, y: PANEL.y + BAR_H + (PANEL.h - BAR_H) / 2};
	const tab = {x: PANEL.x + TOOL_W + 30, y: PANEL.y + BAR_H / 2};
	const iconSize = mix(132, 30, iconToTab) * Math.min(1.08, iconPop);
	const iconPos = {x: mix(center.x, tab.x, iconToTab), y: mix(center.y, tab.y, iconToTab)};
	const filePos = {x: mix(center.x, center.x, fileToIcon), y: mix(center.y, center.y, fileToIcon)};

	// ---------- cursor até o disco
	const discA = discOnScreen(posA);
	const curStart = {x: canvasX + canvasW * 0.18, y: PANEL.y + 170};
	const curT = prog(f, edita - 12, 11, easeInOut);
	const cur = {x: mix(curStart.x, discA.x + discA.r * 0.25, curT), y: mix(curStart.y, discA.y + discA.r * 0.1, curT)};
	const cursorOpacity = prog(f, abre + 12, 6) * (1 - prog(f, edita + 40, 6));

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
						background: `radial-gradient(60% 40% at 50% ${inPanel ? 60 : 50}%, rgba(226,35,26,${inPanel ? 0.1 : 0.22}), rgba(11,11,12,0) 70%)`,
						opacity: prog(f, toPanel + 8, 8),
					}}
				/>
			</MorphBox>

			{/* grade do documento + interface ilustrativa (sem marca de terceiros) */}
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
						<div style={{marginLeft: TOOL_W + 52, padding: '8px 18px', borderRadius: 10, background: 'rgba(245,242,237,0.06)', fontFamily: BRAND.fonts.ui, fontWeight: 600, fontSize: 24, color: BRAND.colors.text}}>{FILE_NAME}</div>
					</div>
					<div style={{position: 'absolute', left: 0, top: BAR_H, bottom: 0, width: TOOL_W, background: BRAND.colors.surface, opacity: chrome, borderRight: '1px solid rgba(245,242,237,0.08)', transform: `translateX(${(chrome - 1) * TOOL_W}px)`}}>
						<Toolbar active={tool} />
					</div>
					<div style={{position: 'absolute', right: 18, top: 14, fontFamily: BRAND.fonts.ui, fontWeight: 500, fontSize: 21, color: BRAND.colors.muted, opacity: label, letterSpacing: '0.01em'}}>Demonstração ilustrativa</div>
				</div>
			) : null}

			{/* arquivo recebido */}
			{f >= recebe - 8 && fileToIcon < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: filePos.x - 80,
						top: filePos.y - 102 - (1 - fileIn) * 150,
						opacity: fileIn * (1 - fileToIcon),
						transform: `scale(${1 - 0.7 * fileToIcon}) rotate(${(1 - fileIn) * -6}deg)`,
					}}
				>
					<FileCard w={160} h={204} style={{filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.5))'}} />
					<div style={{marginTop: 14, textAlign: 'center', fontFamily: BRAND.fonts.ui, fontWeight: 600, fontSize: 22, color: BRAND.colors.text, opacity: prog(f, recebe + 6, 8) * 0.85}}>{FILE_NAME}</div>
				</div>
			) : null}

			{/* ícone do editor: abre o arquivo e vai para a aba */}
			{f >= iconAt && f < mdf ? (
				<Img
					src={staticFile(COREL_ICON)}
					style={{
						position: 'absolute',
						left: iconPos.x - iconSize / 2,
						top: iconPos.y - iconSize / 2,
						width: iconSize,
						height: iconSize,
						opacity: prog(f, iconAt, 4) * (1 - prog(f, mdf - 6, 6)),
						filter: iconToTab < 1 ? `drop-shadow(0 12px 24px rgba(0,0,0,${0.5 * (1 - iconToTab)}))` : undefined,
					}}
				/>
			) : null}

			{f >= abre + 4 ? (
				<div style={{position: 'absolute', inset: 0, opacity: 1 - show3D}}>
					<ModelDrawing place={place} draw={draw} nodes={nodes} select={select} lines={lines} caret={caret} muted={muted} fill={fill} />
				</div>
			) : null}

			{cursorOpacity > 0 ? (
				<div style={{opacity: cursorOpacity}}>
					<Cursor x={cur.x} y={cur.y} press={pulse(f, edita - 1, 6)} />
				</div>
			) : null}

			{/* SEM COMEÇAR DO ZERO */}
			{f >= sem && f < porque + 2 ? (
				<div style={{position: 'absolute', left: PANEL.x + TOOL_W + 34, top: PANEL.y + BAR_H + 104, opacity: 1 - tOut, transform: `translateY(${(1 - tIn) * 20 - tOut * 20}px)`}}>
					<Words text="SEM COMEÇAR" start={sem} size={62} align="left" />
					<div style={{transform: `scale(${1 + 0.12 * zeroPulse})`, transformOrigin: '0% 60%'}}>
						<Words text="DO ZERO" start={sem + 4} size={124} align="left" emphasis={{ZERO: {color: BRAND.colors.laser}}} />
					</div>
				</div>
			) : null}

			{/* peça em MDF (3D), construída do mesmo vetor */}
			{f >= start3D ? (
				<div style={{position: 'absolute', inset: 0, opacity: show3D, transform: `translateY(${retract * 200}px)`}}>
					<Trophy3D start={start3D} />
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
