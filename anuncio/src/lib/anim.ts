import {Easing, interpolate, spring} from 'remotion';
import {ANIM, FPS} from '../config';

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 entre start e start+dur. */
export const prog = (f: number, start: number, dur: number, easing = easeOut) =>
	dur <= 0 ? (f >= start ? 1 : 0) : interpolate(f, [start, start + dur], [0, 1], {...clamp, easing});

/** Visibilidade de um elemento: entra em `start`, sai terminando em `end`. */
export const life = (f: number, start: number, end: number, inDur = ANIM.titleIn, outDur = ANIM.titleOut) =>
	Math.min(prog(f, start, inDur), 1 - prog(f, end - outDur, outDur, easeIn));

/** Mola determinística (acomodação curta). */
export const settle = (f: number, start: number, damping = 13) =>
	spring({frame: f - start, fps: FPS, config: {damping, stiffness: 190, mass: 0.6}});

/** Interpola keyframes [frame, valor] com easeInOut. */
export const keyframes = (f: number, kf: [number, number][]) => {
	if (kf.length === 1) return kf[0][1];
	return interpolate(
		f,
		kf.map((k) => k[0]),
		kf.map((k) => k[1]),
		{...clamp, easing: easeInOut},
	);
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Pulso único 0→1→0 (para ênfase). */
export const pulse = (f: number, start: number, dur = 12) => {
	const t = (f - start) / dur;
	return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * ANIM.intensity;
};
