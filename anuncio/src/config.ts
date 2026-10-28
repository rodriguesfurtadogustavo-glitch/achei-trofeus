import edit from './data/edit.json';

// ------------------------------------------------------------------ marca
// Identidade observada em acheiarquivos.com.br (28/10/2026).
export const BRAND = {
	name: 'Achei Arquivos',
	domain: 'acheiarquivos.com.br',
	presenter: 'Karu',
	presenterRole: 'Fundadora da Achei Troféus',
	colors: {
		bg: '#0B0B0C',
		surface: '#131315',
		text: '#F5F2ED',
		red: '#E2231A',
		laser: '#FF3A2E',
		mdf: '#D2AB7C',
		mdfEdge: '#7A4F28',
		muted: '#9A968F',
	},
	fonts: {
		title: '"Bricolage Grotesque", sans-serif',
		ui: 'Inter, sans-serif',
	},
} as const;

// Intensidade geral das animações (1 = direção original; 0.5 = mais contido).
export const ANIM = {
	intensity: 1,
	titleIn: 8,
	titleOut: 6,
	morph: 10,
};

// ------------------------------------------------------------------ montagem
export const FPS = edit.fps;
export const WIDTH = edit.width;
export const HEIGHT = edit.height;
export const END_CARD_FRAMES = edit.endCardFrames;

export type Clip = (typeof edit.clips)[number] & {start: number; dur: number};

export const CLIPS: Clip[] = (() => {
	let start = 0;
	return edit.clips.map((c) => {
		const clip = {...c, start, dur: c.out - c.in};
		start += clip.dur;
		return clip;
	});
})();

export const END_CARD_START = CLIPS[CLIPS.length - 1].start + CLIPS[CLIPS.length - 1].dur;
export const TOTAL_FRAMES = END_CARD_START + END_CARD_FRAMES;

/** Converte um instante (segundos) do arquivo original do clipe em frame da timeline. */
export const at = (clip: number, sourceSeconds: number) =>
	CLIPS[clip].start + Math.round(sourceSeconds * FPS) - CLIPS[clip].in;

// ------------------------------------------------------------------ legendas
export type Caption = {
	from: number;
	to: number;
	text: string;
	hl?: string;
	hideInVideo?: boolean;
};

export const CAPTIONS: Caption[] = edit.captions.map((c) => ({
	from: at(c.clip, c.from),
	to: Math.min(at(c.clip, c.to) + 4, CLIPS[c.clip].start + CLIPS[c.clip].dur),
	text: c.text,
	hl: (c as {hl?: string}).hl,
	hideInVideo: (c as {hideInVideo?: boolean}).hideInVideo,
}));

// ------------------------------------------------------------------ marcações das cenas
// Todas derivadas das palavras ditas (segundos do arquivo de origem → timeline).
export const CUE = {
	s1: {
		title: 3,
		troféus: at(0, 6.42),
		querComeçar: at(0, 7.12),
		recado: at(0, 8.74),
	},
	s2: {
		lowerThird: at(1, 3.4),
		lowerThirdOut: at(1, 6.6),
		coleção: at(1, 8.5),
		disposição: at(1, 9.46),
		cover: CLIPS[2].start - 10,
	},
	s3: {
		reveal: CLIPS[2].start + 6,
		agora: at(2, 4.7),
		arquivos: at(2, 6.92),
		seuNegócio: at(2, 8.28),
		toPanel: at(2, 9.15),
	},
	s4: {
		recebe: at(3, 4.1),
		abre: at(3, 5.58),
		edita: at(3, 6.86),
		sem: at(3, 8.5),
		zero: at(3, 9.94),
		porque: at(3, 10.3),
		mdf: at(3, 10.62),
		back: at(3, 12.08),
	},
	s5: {
		preço: at(4, 3.1),
		coca: at(4, 3.74),
		flatten: at(4, 4.1),
	},
	s6: {
		modelos: at(5, 4.22),
		nossa: at(5, 5.6),
		sua: at(5, 8.0),
		out: CLIPS[5].start + CLIPS[5].dur - 6,
	},
	s7: {
		conheça: at(6, 3.17),
		saiba: at(6, 5.62),
		pulse: at(6, 6.06),
		toEnd: END_CARD_START - 10,
	},
};

// Câmera virtual sobre o vídeo da apresentadora.
// zoom: [frame local do clipe, escala] (≤ 6% no total). Ancorado no rosto.
export const CAMERA_ZOOM: [number, number][][] = [
	[[0, 1.0], [CUE.s1.recado - CLIPS[0].start, 1.04]],
	[[0, 1.035], [CLIPS[1].dur, 1.05]],
	[[0, 1.02], [CLIPS[2].dur, 1.0]],
	[[0, 1.0], [CLIPS[3].dur, 1.02]],
	[[0, 1.03], [CUE.s5.coca - CLIPS[4].start, 1.03], [CUE.s5.coca - CLIPS[4].start + 6, 1.055], [CLIPS[4].dur, 1.05]],
	[[0, 1.0], [CLIPS[5].dur, 1.03]],
	[[0, 1.0], [CLIPS[6].dur, 1.055]],
];

// Deslocamento vertical global (tela dividida da demonstração principal).
export const DEMO_SHIFT = -330;
export const CAMERA_SHIFT: [number, number][] = [
	[CUE.s3.toPanel, 0],
	[CUE.s3.toPanel + 16, DEMO_SHIFT],
	[CUE.s4.mdf + 22, DEMO_SHIFT],
	[CUE.s4.mdf + 34, 0],
];

// ------------------------------------------------------------------ efeitos sonoros
export const SFX: {src: string; frame: number; volume: number}[] = [
	{src: 'audio/sfx-laser.wav', frame: CUE.s1.troféus - 2, volume: 0.32},
	{src: 'audio/sfx-whoosh.wav', frame: CUE.s2.coleção - 4, volume: 0.4},
	{src: 'audio/sfx-whoosh.wav', frame: CUE.s2.cover - 4, volume: 0.35},
	{src: 'audio/sfx-laser.wav', frame: CUE.s3.arquivos + 2, volume: 0.26},
	{src: 'audio/sfx-whoosh.wav', frame: CUE.s3.toPanel - 2, volume: 0.32},
	{src: 'audio/sfx-laser.wav', frame: CUE.s4.recebe + 10, volume: 0.28},
	{src: 'audio/sfx-thud.wav', frame: CUE.s4.mdf + 26, volume: 0.55},
	{src: 'audio/sfx-can.wav', frame: CUE.s5.coca, volume: 0.45},
	{src: 'audio/sfx-whoosh.wav', frame: CUE.s5.flatten + 2, volume: 0.28},
	{src: 'audio/sfx-laser.wav', frame: CUE.s6.sua - 8, volume: 0.24},
	{src: 'audio/sfx-accent.wav', frame: CUE.s7.saiba, volume: 0.45},
	{src: 'audio/sfx-laser.wav', frame: END_CARD_START + 6, volume: 0.3},
];

// Mixagem (o master final é normalizado a -16 LUFS / -1 dBTP no pós; ver README).
export const MIX = {
	voice: 1,
	musicBed: 0.5,
	musicUnderVoice: 0.13,
	duckAttack: 4,
	duckRelease: 10,
};
