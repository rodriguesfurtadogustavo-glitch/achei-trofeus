import React, {useEffect, useMemo, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BRAND} from '../config';
import {easeInOut, easeOut, mix, prog} from '../lib/anim';

/*
 * Troféu montado a partir das CAMADAS REAIS do modelo de judô do catálogo
 * (public/judo/l1..l5 — todas no mesmo quadro 760×1330, já alinhadas como na peça).
 * Cada camada vira uma chapa: face com a foto da camada + borda de MDF construída por
 * fatias recortadas pela máscara da própria camada. A placa usa o texto editado na demo.
 *
 * Escala: 380 px da arte = 1 unidade (peça com 3,5 unidades de altura). Câmera fov 30°,
 * z = 13.062 → 274,3 px/unidade em z=0: a vista frontal coincide com o desenho 2D
 * (960 px de altura, topo em y=360), acima da área das legendas.
 */
export const TROPHY_SCREEN = {left: 540 - (960 * 760) / 1330 / 2, top: 360, width: (960 * 760) / 1330, height: 960};
export const CAMERA_Z = 1920 / (2 * Math.tan((15 * Math.PI) / 180) * (960 / 3.5));
const GROUP_Y = (960 - (TROPHY_SCREEN.top + TROPHY_SCREEN.height / 2)) / (960 / 3.5);

const PX = 1 / 380;
const W = 760 * PX;
const H = 1330 * PX;

type Layer = {id: string; thickness: number; z: number; delay: number; edge: string};
// z = posição da face de trás de cada chapa na peça montada
const LAYERS: Layer[] = [
	{id: 'l1', thickness: 0.075, z: 0, delay: 0, edge: BRAND.colors.mdfEdge},
	{id: 'l2', thickness: 0.035, z: 0.075, delay: 4, edge: '#8A6A2E'},
	{id: 'l3', thickness: 0.03, z: 0.11, delay: 8, edge: BRAND.colors.mdfEdge},
	{id: 'l4', thickness: 0.16, z: -0.04, delay: 2, edge: BRAND.colors.mdfEdge},
	{id: 'l5', thickness: 0.018, z: 0.12, delay: 10, edge: '#8A6A2E'},
];

const usePlaqueTexture = (text: string, sub: string) =>
	useMemo(() => {
		if (typeof document === 'undefined') return null;
		const c = document.createElement('canvas');
		c.width = 760;
		c.height = 1330;
		const g = c.getContext('2d')!;
		// placa dourada (mesma área da placa original: x 45–667, y 1128–1266)
		const grd = g.createLinearGradient(45, 1128, 667, 1266);
		grd.addColorStop(0, '#B8892F');
		grd.addColorStop(0.45, '#F1D27A');
		grd.addColorStop(1, '#A57A26');
		g.fillStyle = grd;
		g.fillRect(45, 1128, 622, 138);
		g.strokeStyle = 'rgba(60,40,10,0.55)';
		g.lineWidth = 4;
		g.strokeRect(53, 1136, 606, 122);
		g.fillStyle = '#1B1408';
		g.textAlign = 'center';
		g.font = '800 44px "Bricolage Grotesque"';
		g.fillText(text, 356, 1196);
		g.font = '700 30px Inter';
		g.fillText(sub, 356, 1238);
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, [text, sub]);

const useTextures = () => {
	const [handle] = useState(() => delayRender('Texturas do troféu'));
	const [tex, setTex] = useState<Record<string, THREE.Texture> | null>(null);
	useEffect(() => {
		const loader = new THREE.TextureLoader();
		const ids = ['l1', 'l2', 'l3', 'l4', 'm1', 'm2', 'm3', 'm4', 'm5'];
		Promise.all(ids.map((id) => loader.loadAsync(staticFile(`judo/${id}.${id.startsWith('l') ? 'webp' : 'png'}`))))
			.then((list) => {
				const out: Record<string, THREE.Texture> = {};
				list.forEach((t, i) => {
					if (ids[i].startsWith('l')) t.colorSpace = THREE.SRGBColorSpace;
					t.anisotropy = 4;
					out[ids[i]] = t;
				});
				setTex(out);
				continueRender(handle);
			})
			.catch((e) => {
				console.error(e);
				continueRender(handle);
			});
	}, [handle]);
	return tex;
};

const Slab: React.FC<{
	face: THREE.Texture;
	mask: THREE.Texture;
	thickness: number;
	edge: string;
	faceOpacity: number;
	depth: number;
}> = ({face, mask, thickness, edge, faceOpacity, depth}) => {
	const geo = useMemo(() => new THREE.PlaneGeometry(W, H), []);
	const slices = 9;
	const t = Math.max(0.0001, thickness * depth);
	return (
		<group>
			{Array.from({length: slices}).map((_, i) => (
				<mesh key={i} geometry={geo} position={[0, 0, (i / slices) * t]}>
					<meshStandardMaterial color={edge} alphaMap={mask} alphaTest={0.5} transparent={false} roughness={0.85} side={THREE.DoubleSide} />
				</mesh>
			))}
			<mesh geometry={geo} position={[0, 0, t]}>
				<meshStandardMaterial map={face} alphaMap={mask} alphaTest={0.5} roughness={0.42} metalness={0.05} transparent opacity={faceOpacity} />
			</mesh>
		</group>
	);
};

const ShadowPlane: React.FC<{opacity: number}> = ({opacity}) => {
	const tex = useMemo(() => {
		if (typeof document === 'undefined') return null;
		const c = document.createElement('canvas');
		c.width = 256;
		c.height = 256;
		const g = c.getContext('2d')!;
		const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
		r.addColorStop(0, 'rgba(0,0,0,0.85)');
		r.addColorStop(1, 'rgba(0,0,0,0)');
		g.fillStyle = r;
		g.fillRect(0, 0, 256, 256);
		return new THREE.CanvasTexture(c);
	}, []);
	if (!tex) return null;
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -H / 2 + 0.005, 0.05]} scale={[2.6, 0.9, 1]}>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
		</mesh>
	);
};

/**
 * @param start frame em que o 3D começa (vista frontal, chapas sem espessura)
 * Fases: 0–12 ganha espessura · 6–22 camadas se aproximam e encaixam · giro de ~11° e
 * aproximação suave ao longo de toda a cena · brilho percorre a peça após o encaixe.
 */
export const Trophy3D: React.FC<{start: number; plaque: [string, string]}> = ({start, plaque}) => {
	const f = useCurrentFrame();
	const tex = useTextures();
	const plaqueTex = usePlaqueTexture(plaque[0], plaque[1]);
	const local = f - start;
	const depth = prog(local, 0, 14, easeOut);
	const orbit = mix(0, -11, prog(local, 4, 44, easeInOut)) * (Math.PI / 180);
	const tilt = mix(0, 4, prog(local, 4, 44, easeInOut)) * (Math.PI / 180);
	const dolly = mix(CAMERA_Z, CAMERA_Z - 1.2, prog(local, 0, 56, easeInOut));
	const glint = prog(local, 24, 18, easeInOut);
	const faceOpacity = prog(local, 0, 10);

	return (
		<ThreeCanvas width={1080} height={1920} camera={{fov: 30, position: [0, 0, dolly], near: 0.1, far: 100}} gl={{alpha: true, antialias: true}} style={{position: 'absolute', inset: 0}}>
			<ambientLight intensity={1.55} />
			<directionalLight position={[-3, 4, 6]} intensity={1.6} />
			<directionalLight position={[4, 1, -3]} intensity={0.9} color={BRAND.colors.laser} />
			<pointLight position={[mix(-2.6, 2.6, glint), mix(1.6, -0.4, glint), 1.4]} intensity={glint > 0 && glint < 1 ? 7 * Math.sin(Math.PI * glint) : 0} distance={6} color="#FFE7C2" />
			{tex && plaqueTex ? (
				<group position={[0, GROUP_Y, 0]} rotation={[tilt, orbit, 0]}>
					{LAYERS.map((layer, i) => {
						const assemble = prog(local, 6 + layer.delay, 14, easeOut);
						const explode = 1 - assemble;
						const zSpread = (i === 3 ? -0.5 : 0.35 + i * 0.22) * explode;
						const ySpread = (i === 3 ? -0.25 : i === 4 ? -0.32 : 0) * explode;
						const faceTex = layer.id === 'l5' ? plaqueTex : tex[layer.id];
						return (
							<group key={layer.id} position={[0, ySpread, layer.z + zSpread]}>
								<Slab face={faceTex} mask={tex[`m${i + 1}`]} thickness={layer.thickness} edge={layer.edge} faceOpacity={faceOpacity} depth={depth} />
							</group>
						);
					})}
					<ShadowPlane opacity={0.55 * depth} />
				</group>
			) : null}
		</ThreeCanvas>
	);
};
