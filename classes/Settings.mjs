import { MODULENAME, ENABLE_BUTTON_SETTING, DEBUG_MODE_SETTING } from './CONST.mjs';

// A class used to register the module settings
export class Settings {

    static registerSettings() {
      // register the setting to turn off the module
      game.settings.register(MODULENAME, ENABLE_BUTTON_SETTING, {
        name: `${MODULENAME}.settings.${ENABLE_BUTTON_SETTING}.Name`,
        default: true,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${ENABLE_BUTTON_SETTING}.Hint`,
        onChange: () => ui.players.render()
      });

      // register the setting to run the debug mode
      game.settings.register(MODULENAME, DEBUG_MODE_SETTING, {
        name: `${MODULENAME}.settings.${DEBUG_MODE_SETTING}.Name`,
        default: false,
        type: Boolean,
        scope: 'world',
        config: true,
        hint: `${MODULENAME}.settings.${DEBUG_MODE_SETTING}.Hint`,
        onChange: () => ui.players.render()
      });

      console.log(`${MODULENAME} | Settings registered`);
    }
    
    static getEnabled() {
      return game.settings.get(MODULENAME, ENABLE_BUTTON_SETTING);
    };

    static getDebugMode() {
      return game.settings.get(MODULENAME, DEBUG_MODE_SETTING);
    };
}