import { qs } from './utils';
import { TCanvas } from './webgl/TCanvas';

// Get canvas using query selector
const canvas = new TCanvas(qs<HTMLDivElement>('.canvas-container'));

window.addEventListener('beforeunload', () => {
	canvas.dispose();
});
