import { MODULENAME } from "./RoofVisionFade.mjs";

// A class used to register the module settings
export class Settings {
 
    static ENABLE_BUTTON_SETTING = 'enable-button';

    static registerSettings() {
      // register the setting to turn off the module
      game.settings.register(MODULENAME, this.ENABLE_BUTTON_SETTING, {
        name: `${MODULENAME}.settings.${this.ENABLE_BUTTON_SETTING}.Name`,
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${this.ENABLE_BUTTON_SETTING}.Hint`,
        onChange: () => ui.players.render()
      });
      
    }
}