// Gera o SRT completo (inclusive frases que no vídeo aparecem como título cinético).
// Usa os mesmos cálculos da timeline de src/config.ts. Uso: node scripts/make_srt.mjs [saida.srt]
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const edit = JSON.parse(readFileSync(path.resolve('src/data/edit.json'), 'utf8'));
const fps = edit.fps;
let start = 0;
const clips = edit.clips.map((c) => {
	const first = start;
	const segments = c.segments.map(([a, b]) => {
		const seg = {in: a, out: b, start};
		start += b - a;
		return seg;
	});
	return {segments, start: first, dur: start - first};
});
// mesmo cálculo de `at` em src/config.ts (pausas removidas → trecho seguinte/anterior)
const at = (i, s, bias = 'next') => {
	const sf = Math.round(s * fps);
	const segs = clips[i].segments;
	for (let k = 0; k < segs.length; k++) {
		const g = segs[k];
		if (sf < g.in) return k === 0 || bias === 'next' ? g.start : segs[k - 1].start + (segs[k - 1].out - segs[k - 1].in);
		if (sf < g.out) return g.start + sf - g.in;
	}
	const last = segs[segs.length - 1];
	return last.start + (last.out - last.in);
};
const rows = edit.captions.map((c) => ({from: at(c.clip, c.from), to: Math.min(at(c.clip, c.to, 'prev') + 4, clips[c.clip].start + clips[c.clip].dur), text: c.text}));
for (let i = 0; i < rows.length - 1; i++) rows[i].to = Math.min(rows[i].to, rows[i + 1].from);
const ts = (frame) => {
	const ms = Math.round((frame / fps) * 1000);
	const p = (n, l = 2) => String(n).padStart(l, '0');
	return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = rows.map((r, i) => `${i + 1}\n${ts(r.from)} --> ${ts(r.to)}\n${r.text}\n`).join('\n');
const out = path.resolve(process.argv[2] ?? 'out/achei-arquivos-anuncio.srt');
mkdirSync(path.dirname(out), {recursive: true});
writeFileSync(out, srt);
console.log(`${rows.length} legendas → ${out}`);
