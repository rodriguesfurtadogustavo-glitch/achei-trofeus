// Renderiza quadros isolados para autoinspeção: node scripts/stills.mjs 30 90 115 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const LOCAL_CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(LOCAL_CHROME) ? LOCAL_CHROME : null);
const frames = process.argv.slice(2).map(Number);
const outDir = path.resolve('out/samples');
mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const chromiumOptions = {gl: 'swangle'};
const composition = await selectComposition({serveUrl, id: 'AcheiArquivos', browserExecutable, chromiumOptions});
for (const frame of frames) {
	const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`);
	await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable, chromiumOptions, scale: 0.5});
	console.log(output);
}
