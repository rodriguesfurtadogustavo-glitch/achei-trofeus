import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {CAPTIONS, CLIPS, MIX, SFX, TOTAL_FRAMES} from '../config';

/**
 * Mixagem: voz (já tratada em voice.wav) com prioridade; música com ducking calculado
 * a partir dos trechos de fala (legendas, inclusive as ocultas); poucos efeitos.
 */
const duckCurve: number[] = (() => {
	const speaking = new Array(TOTAL_FRAMES).fill(false);
	for (const c of CAPTIONS) for (let i = c.from - 2; i < c.to; i++) if (i >= 0 && i < TOTAL_FRAMES) speaking[i] = true;
	const lift = CLIPS[5].start; // a trilha cresce de forma discreta a partir da cena 6
	const out: number[] = [];
	let v = MIX.musicBed;
	for (let i = 0; i < TOTAL_FRAMES; i++) {
		const under = i >= lift ? MIX.musicUnderVoice * 1.35 : MIX.musicUnderVoice;
		const target = speaking[i] ? under : MIX.musicBed;
		const rate = target < v ? 1 / MIX.duckAttack : 1 / MIX.duckRelease;
		v += (target - v) * Math.min(1, rate * 2.2);
		out.push(v);
	}
	// olha à frente: começa a abaixar antes da primeira sílaba
	return out.map((x, i) => Math.min(x, ...out.slice(i, i + MIX.duckAttack)));
})();

export const AudioMix: React.FC = () => (
	<>
		<Audio src={staticFile('audio/voice.wav')} volume={MIX.voice} />
		<Audio src={staticFile('audio/music.wav')} volume={(f) => duckCurve[Math.min(f, duckCurve.length - 1)]} />
		{SFX.map((s, i) => (
			<Sequence key={i} from={s.frame} layout="none">
				<Audio src={staticFile(s.src)} volume={s.volume} />
			</Sequence>
		))}
	</>
);
