import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND} from './config';
import {loadFonts} from './lib/fonts';
import {Presenter} from './components/Presenter';
import {Captions} from './components/Captions';
import {EndCard} from './components/EndCard';
import {AudioMix} from './components/AudioMix';
import {Grain} from './components/Grain';
import {Scene1} from './scenes/Scene1';
import {CollectionToFile, Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';
import {Scene7} from './scenes/Scene7';

loadFonts();

/** O ARQUIVO GANHA FORMA — linha laser → arquivo → desenho → volume → chamada. */
export const AcheiArquivos: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: BRAND.colors.bg}}>
		<Presenter />
		<Scene1 />
		<Scene2 />
		<Scene3 />
		<Scene4 />
		<Scene5 />
		<Scene6 />
		<Scene7 />
		<CollectionToFile />
		<Captions />
		<EndCard />
		<Grain />
		<AudioMix />
	</AbsoluteFill>
);
