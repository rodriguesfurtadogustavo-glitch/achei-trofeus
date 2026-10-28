import {continueRender, delayRender, staticFile} from 'remotion';

// Fontes empacotadas em public/fonts (OFL): Bricolage Grotesque 700/800 e Inter 500–800.
const FACES: [string, string, string][] = [
	['Bricolage Grotesque', '700', 'fonts/bricolage-grotesque-latin-700-normal.woff2'],
	['Bricolage Grotesque', '800', 'fonts/bricolage-grotesque-latin-800-normal.woff2'],
	['Inter', '500', 'fonts/inter-latin-500-normal.woff2'],
	['Inter', '600', 'fonts/inter-latin-600-normal.woff2'],
	['Inter', '700', 'fonts/inter-latin-700-normal.woff2'],
	['Inter', '800', 'fonts/inter-latin-800-normal.woff2'],
];

let loaded = false;
export const loadFonts = () => {
	if (loaded || typeof document === 'undefined') return;
	loaded = true;
	const handle = delayRender('Carregando fontes');
	Promise.all(
		FACES.map(([family, weight, file]) => {
			const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight});
			document.fonts.add(face);
			return face.load();
		}),
	)
		.then(() => continueRender(handle))
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
};
