import { Settings } from './classes/Settings.mjs';
import { RoofVisionFade, MODULENAME } from './classes/RoofVisionFade.mjs';

console.log(`${MODULENAME} | Module loaded`);

Hooks.once('i18nInit', () => {
    Settings.registerSettings();
});

Hooks.on('ready', () => {
    RoofVisionFade.addRoofVisionFadeModule();
});