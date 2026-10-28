import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BRAND} from '../config';
import {easeInOut, easeOut, mix, prog, pulse} from '../lib/anim';

/**
 * Lata de refrigerante ILUSTRATIVA, sem marca: corpo vermelho liso, ombro e tampa de alumínio.
 * Entra girando, dá um pulso na palavra “coca” e depois se achata num disco (vista de cima).
 * Coordenadas: câmera fov 30°, z = 11.4 → 314 px/unidade em z = 0.
 */
export const CAN_CENTER = {x: 892, y: 400};
const PPU = 314;
const toWorld = (x: number, y: number): [number, number] => [(x - 540) / PPU, (960 - y) / PPU];

const bodyProfile = () => {
	const pts: THREE.Vector2[] = [];
	const add = (r: number, y: number) => pts.push(new THREE.Vector2(r, y));
	add(0.0, -0.8);
	add(0.36, -0.8);
	add(0.42, -0.77);
	add(0.5, -0.66);
	add(0.5, 0.56);
	add(0.44, 0.68);
	add(0.4, 0.72);
	return pts;
};
const rimProfile = () => [
	new THREE.Vector2(0.4, 0.72),
	new THREE.Vector2(0.405, 0.8),
	new THREE.Vector2(0.385, 0.815),
	new THREE.Vector2(0.37, 0.8),
	new THREE.Vector2(0.0, 0.79),
];

export const SodaCan3D: React.FC<{enter: number; coca: number; flatten: number}> = ({enter, coca, flatten}) => {
	const f = useCurrentFrame();
	const body = useMemo(() => new THREE.LatheGeometry(bodyProfile(), 72), []);
	const rim = useMemo(() => new THREE.LatheGeometry(rimProfile(), 72), []);
	const tIn = prog(f, enter, 14, easeOut);
	const spin = mix(-Math.PI * 1.1, 0.35, tIn) + (f - enter) * 0.012;
	const flat = prog(f, flatten, 8, easeInOut);
	const s = (0.62 + 0.38 * tIn) * (1 + 0.1 * pulse(f, coca, 10)) * 0.62;
	const [x, y] = toWorld(CAN_CENTER.x, CAN_CENTER.y + (1 - tIn) * 120);
	const visible = f >= enter && flat < 1;
	if (!visible) return null;
	return (
		<ThreeCanvas width={1080} height={1920} camera={{fov: 30, position: [0, 0, 11.4]}} gl={{alpha: true, antialias: true}} style={{position: 'absolute', inset: 0}}>
			<ambientLight intensity={0.9} />
			<directionalLight position={[-3, 3, 5]} intensity={2.2} />
			<directionalLight position={[3, -1, 2]} intensity={0.8} color="#FFD9C9" />
			<group
				position={[x, y, 0]}
				rotation={[mix(0.12, Math.PI / 2, flat), spin * (1 - flat), mix(-0.18 * (1 - tIn) + 0.06, 0, flat)]}
				scale={[s, s * mix(1, 0.06, flat), s]}
			>
				<mesh geometry={body}>
					<meshStandardMaterial color={BRAND.colors.red} roughness={0.28} metalness={0.35} />
				</mesh>
				<mesh geometry={rim}>
					<meshStandardMaterial color="#D9D9DE" roughness={0.25} metalness={0.85} />
				</mesh>
				{/* anel de abertura (genérico) */}
				<mesh position={[0.12, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
					<torusGeometry args={[0.08, 0.018, 12, 32]} />
					<meshStandardMaterial color="#C8C8CF" roughness={0.3} metalness={0.9} />
				</mesh>
				{/* faixa clara sutil, sem logotipo */}
				<mesh position={[0, -0.05, 0]}>
					<cylinderGeometry args={[0.503, 0.503, 0.08, 72, 1, true]} />
					<meshStandardMaterial color="#F5F2ED" roughness={0.4} metalness={0.1} />
				</mesh>
			</group>
		</ThreeCanvas>
	);
};

/** Tamanho em pixels do disco (lata achatada vista de cima) para a transição 2D. */
export const CAN_DISC_RADIUS = 0.5 * 0.62 * PPU;
