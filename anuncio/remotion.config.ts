import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

// Chrome headless já instalado neste ambiente; em outra máquina, o Remotion baixa o próprio.
const LOCAL_CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = process.env.REMOTION_BROWSER ?? (existsSync(LOCAL_CHROME) ? LOCAL_CHROME : null);
if (browser) {
	Config.setBrowserExecutable(browser);
}

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
// WebGL por software (sem GPU) para o trecho 3D.
Config.setChromiumOpenGlRenderer('swangle');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
Config.setAudioCodec('aac');
Config.setConcurrency(4);
Config.setOverwriteOutput(true);
