import { Settings } from './classes/Settings.mjs';
import { RoofVisionFade } from './classes/RoofVisionFade.mjs';
import { MODULENAME } from './classes/CONST.mjs';

console.log(`${MODULENAME} | Module loaded`);

Hooks.once('i18nInit', () => {
    console.log(`${MODULENAME} | Initializing module`);
    Settings.registerSettings();
});

Hooks.on('ready', () => {
    // only enable if the user is the GM. players do not have access to update the tiles
    if(game.user.isGM) {
        console.log(`${MODULENAME} | Adding Roof Vision Fade module`);
        RoofVisionFade.addRoofVisionFadeModule();
    }
});