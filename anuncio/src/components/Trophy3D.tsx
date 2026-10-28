import React, {useEffect, useMemo, useState} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {BRAND} from '../config';
import {easeInOut, easeOut, mix, prog} from '../lib/anim';
import {AXIS_X, BASE, DISC, DISC_TEXT, MODEL_H, MODEL_MID_Y, MODEL_TOP} from '../lib/model';
import {MODEL} from '../data/modelPaths';

/*
 * Peça em MDF construída a partir do VETOR do modelo “asas” do catálogo (o mesmo do desenho 2D):
 * chapa preta extrudada com borda de MDF, asas douradas em acrílico, disco com o texto editado
 * e base sextavada em dois andares. 100 px do vetor = 1 unidade.
 *
 * Vista frontal alinhada ao desenho 2D: peça com 960 px de altura, topo em y = 360.
 */
export const TROPHY_PLACE = {cx: 540, top: 360, height: 960};
const PPU = (TROPHY_PLACE.height / MODEL_H) * 100; // px por unidade em z = 0
export const CAMERA_Z = 1920 / (2 * Math.tan((15 * Math.PI) / 180) * PPU);
const GROUP_Y = (960 - (TROPHY_PLACE.top + (MODEL_MID_Y - MODEL_TOP) * (TROPHY_PLACE.height / MODEL_H))) / PPU;

const U = 1 / 100;
const toV = ([x, y]: number[]) => new THREE.Vector2((x - AXIS_X) * U, (MODEL_MID_Y - y) * U);
const shapeOf = (outer: number[][], holes: number[][][]) => {
	const s = new THREE.Shape(outer.map(toV));
	for (const h of holes) s.holes.push(new THREE.Path(h.map(toV)));
	return s;
};

const SLAB = 0.14; // chapa preta (MDF)
const ACRYLIC = 0.035; // asas douradas

const useEnvironment = () => {
	const gl = useThree((s) => s.gl);
	return useMemo(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		pmrem.dispose();
		return env;
	}, [gl]);
};

/** Foto do modelo como textura das asas: UV das faces da extrusão = coordenadas do vetor. */
const usePhotoTexture = () => {
	const [handle] = useState(() => delayRender('Textura do modelo'));
	const [tex, setTex] = useState<THREE.Texture | null>(null);
	useEffect(() => {
		new THREE.TextureLoader()
			.loadAsync(staticFile('models/modelo-asas.webp'))
			.then((t) => {
				t.colorSpace = THREE.SRGBColorSpace;
				t.anisotropy = 8;
				// unidade → pixel da foto: u = (x·100 + eixo)/520, v = 1 − (meioY − y·100)/520
				t.repeat.set(100 / 520, 100 / 520);
				t.offset.set(AXIS_X / 520, 1 - MODEL_MID_Y / 520);
				setTex(t);
				continueRender(handle);
			})
			.catch((e) => {
				console.error(e);
				continueRender(handle);
			});
	}, [handle]);
	return tex;
};

const useDiscTexture = () =>
	useMemo(() => {
		if (typeof document === 'undefined') return null;
		const c = document.createElement('canvas');
		c.width = 1024;
		c.height = 1024;
		const g = c.getContext('2d')!;
		const k = 512 / DISC.r; // px da textura por px do vetor
		const grd = g.createRadialGradient(430, 380, 40, 512, 512, 560);
		grd.addColorStop(0, '#FFFFFF');
		grd.addColorStop(1, '#E7E3DC');
		g.fillStyle = grd;
		g.fillRect(0, 0, 1024, 1024);
		g.textAlign = 'center';
		g.fillStyle = BRAND.colors.red;
		g.font = `800 ${DISC.r * 0.17 * k}px Inter`;
		g.letterSpacing = `${DISC.r * 0.03 * k}px`;
		g.fillText(DISC_TEXT.kicker, 512, 512 - DISC.r * 0.42 * k);
		g.letterSpacing = '0px';
		g.fillStyle = BRAND.colors.bg;
		g.font = `800 ${DISC.r * 0.33 * k}px "Bricolage Grotesque"`;
		DISC_TEXT.after.forEach((l, i) => g.fillText(l, 512, 512 + (-0.02 + i * 0.36) * DISC.r * k));
		g.globalAlpha = 0.75;
		g.font = `700 ${DISC.r * 0.15 * k}px Inter`;
		g.fillText(DISC_TEXT.year, 512, 512 + DISC.r * 0.78 * k);
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 8;
		return t;
	}, []);

const useShadowTexture = () =>
	useMemo(() => {
		if (typeof document === 'undefined') return null;
		const c = document.createElement('canvas');
		c.width = 256;
		c.height = 256;
		const g = c.getContext('2d')!;
		const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
		r.addColorStop(0, 'rgba(0,0,0,0.9)');
		r.addColorStop(1, 'rgba(0,0,0,0)');
		g.fillStyle = r;
		g.fillRect(0, 0, 256, 256);
		return new THREE.CanvasTexture(c);
	}, []);

const Piece: React.FC<{local: number; photo: THREE.Texture}> = ({local, photo}) => {
	const env = useEnvironment();
	const discTex = useDiscTexture();
	const shadowTex = useShadowTexture();
	const bodyGeo = useMemo(
		() =>
			new THREE.ExtrudeGeometry(
				MODEL.body.map((s) => shapeOf(s.outer, s.holes)),
				{depth: SLAB, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2, curveSegments: 6},
			),
		[],
	);
	const goldGeo = useMemo(
		() => MODEL.gold.map((s) => new THREE.ExtrudeGeometry(shapeOf(s.outer, []), {depth: ACRYLIC, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2})),
		[],
	);

	const depth = Math.max(0.02, prog(local, 0, 14, easeOut));
	const wings = prog(local, 8, 14, easeOut);
	const disc = prog(local, 12, 14, easeOut);
	const base = prog(local, 4, 14, easeOut);

	const black = {color: '#0A0A0B', roughness: 0.24, metalness: 0.0, envMap: env, envMapIntensity: 0.07};
	const mdf = {color: BRAND.colors.mdfEdge, roughness: 0.85, metalness: 0, envMap: env, envMapIntensity: 0.2};
	const discY = (MODEL_MID_Y - DISC.cy) * U;
	const tier = (t: typeof BASE.upper, explodeY: number) => ({
		r: t.r * U,
		h: (t.y1 - t.y0) * U,
		y: (MODEL_MID_Y - (t.y0 + t.y1) / 2) * U - explodeY,
		x: (t.cx - AXIS_X) * U,
	});
	const up = tier(BASE.upper, (1 - base) * 0.45);
	const low = tier(BASE.lower, (1 - base) * 0.7);

	return (
		<group>
			{/* chapa preta: face brilhante, borda de MDF */}
			<mesh geometry={bodyGeo} scale={[1, 1, depth]} position={[0, 0, (-SLAB / 2) * depth]}>
				<meshStandardMaterial attach="material-0" {...black} />
				<meshStandardMaterial attach="material-1" {...mdf} />
			</mesh>
			{/* asas douradas (acrílico espelhado) */}
			{goldGeo.map((g, i) => {
				const side = MODEL.gold[i].outer[0][0] < AXIS_X ? -1 : 1;
				return (
					<mesh key={i} geometry={g} position={[side * (1 - wings) * 0.7, 0, SLAB / 2 * depth + (1 - wings) * 0.5]} scale={[1, 1, depth]}>
						<meshStandardMaterial attach="material-0" map={photo} color="#FFFFFF" metalness={0.55} roughness={0.32} envMap={env} envMapIntensity={0.45} />
						<meshStandardMaterial attach="material-1" color="#9C7424" metalness={0.8} roughness={0.35} envMap={env} envMapIntensity={0.6} />
					</mesh>
				);
			})}
			{/* disco personalizado */}
			<group position={[(DISC.cx - AXIS_X) * U, discY, SLAB / 2 * depth + 0.012 + (1 - disc) * 0.9]}>
				<mesh>
					<circleGeometry args={[DISC.r * U, 96]} />
					<meshStandardMaterial map={discTex} roughness={0.5} metalness={0} envMap={env} envMapIntensity={0.25} />
				</mesh>
				<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]}>
					<cylinderGeometry args={[DISC.r * U, DISC.r * U, 0.02, 96, 1, true]} />
					<meshStandardMaterial color="#D9D4CB" roughness={0.6} />
				</mesh>
			</group>
			{/* base sextavada em dois andares (face de frente) */}
			{[up, low].map((t, i) => (
				<mesh key={i} position={[t.x, t.y, 0]} rotation={[0, Math.PI / 6, 0]}>
					<cylinderGeometry args={[t.r, t.r, t.h, 6]} />
					<meshStandardMaterial color="#0C0C0D" roughness={0.26} metalness={0.05} envMap={env} envMapIntensity={0.12} flatShading />
				</mesh>
			))}
			{shadowTex ? (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, low.y - low.h / 2 + 0.004, 0]} scale={[3.4, 1.4, 1]}>
					<planeGeometry args={[1, 1]} />
					<meshBasicMaterial map={shadowTex} transparent opacity={0.6 * base} depthWrite={false} />
				</mesh>
			) : null}
		</group>
	);
};

/**
 * @param start frame em que o 3D começa (vista frontal, sem espessura).
 * 0–14 ganha espessura · base sobe, asas encaixam, disco assenta (4–26) · giro de ~11° com
 * aproximação suave · brilho percorre a peça depois do encaixe.
 */
export const Trophy3D: React.FC<{start: number}> = ({start}) => {
	const f = useCurrentFrame();
	const photo = usePhotoTexture();
	const local = f - start;
	if (!photo) return null;
	const orbit = mix(0, -11, prog(local, 4, 44, easeInOut)) * (Math.PI / 180);
	const tilt = mix(0, 5, prog(local, 4, 44, easeInOut)) * (Math.PI / 180);
	const dolly = mix(CAMERA_Z, CAMERA_Z * 0.92, prog(local, 0, 56, easeInOut));
	const glint = prog(local, 24, 18, easeInOut);
	return (
		<ThreeCanvas width={1080} height={1920} camera={{fov: 30, position: [0, 0, dolly], near: 0.1, far: 100}} gl={{alpha: true, antialias: true}} flat style={{position: 'absolute', inset: 0}}>
			<ambientLight intensity={0.25} />
			<directionalLight position={[-3, 4, 6]} intensity={1.5} />
			<directionalLight position={[4, 1, -3]} intensity={1.0} color={BRAND.colors.laser} />
			<pointLight position={[mix(-2.4, 2.4, glint), mix(1.8, -0.2, glint), 1.6]} intensity={glint > 0 && glint < 1 ? 9 * Math.sin(Math.PI * glint) : 0} distance={6} color="#FFE7C2" />
			<group position={[0, GROUP_Y, 0]} rotation={[tilt, orbit, 0]}>
				<Piece local={local} photo={photo} />
			</group>
		</ThreeCanvas>
	);
};
