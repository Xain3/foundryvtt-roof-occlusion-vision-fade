import { Settings } from "./Settings.mjs";
import { OcclusionManager } from "./OcclusionManager.mjs";
import { MODULENAME, FLAGS } from "./CONST.mjs";

// Change this to true to enable debug mode
const debugMode = true;

// A class that contains the main functionality for the module
export class RoofVisionFade {
    
    /**
     * Adds the Roof Vision Fade module by hooking into the 'renderTileConfig' and 'refreshToken' events.
     * 
     * - On 'renderTileConfig': Adds the Roof Vision Fade UI if the ENABLE_BUTTON_SETTING is enabled.
     * - On 'refreshToken': Updates tile occlusion modes based on token ownership and position relative to tiles.
     * 
     * Hooks:
     * - 'renderTileConfig': Adds the Roof Vision Fade UI to the Tile Configuration dialog.
     * - 'refreshToken': Updates tile occlusion modes based on token ownership and position.
     * 
     * @static
     * @method addRoofVisionFadeModule
     */
    static tilesWithAlsoFade = new Set();
    static selectedTokens = new Set();
    static debugMode = Settings.getDebugMode();
    
    static addRoofVisionFadeModule() {
        
        // Add the Roof Vision Fade module
        Hooks.on('renderTileConfig', (app, html, data) => { 
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!Settings.getEnabled()) {
                return;
            }
            
            // Add the UI
            this.addRoofVisionFadeUI(app, html, data);     
        });
        
        // If the scene is changed, clear the selected tokens and tiles with also fade sets
        Hooks.on('canvasTearDown', () => {
            RoofVisionFade.tilesWithAlsoFade.clear();
            RoofVisionFade.selectedTokens.clear();
        });

        // When a token is selected or deselected, update the selectedTokens set and evaluate occlusion
        Hooks.on('controlToken', (token, controlled) => {

            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!Settings.getEnabled()) {
                return;
            }
            if (this.debugMode) {console.log(`Roof Vision Fade \| Token ${token.id} is controlled: ${controlled}`)}  // DEBUG - log the token id
            if (controlled) {
                RoofVisionFade.selectedTokens.add(token);
            }
            else {
                RoofVisionFade.selectedTokens.delete(token);
            }
            // Update the occlusion modes of tiles based on the token's position
            OcclusionManager.evaluateOcclusion([...RoofVisionFade.tilesWithAlsoFade], [...RoofVisionFade.selectedTokens]);
        });

        Hooks.on('refreshTile', (tile, data, options, userId) => {
            this.setTilesWithAlsoFade(tile);
        });
        
        // When a tile setting is updated, update the tilesWithAlsoFade set
        Hooks.on('updateTile', (tile, data, options, userId) => {
            this.setTilesWithAlsoFade(tile);
        });

        // When a token is updated (e.g. is moved), update the occlusion modes of tiles based on the token's position
        Hooks.on('updateToken', (token) => {
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!Settings.getEnabled()) {
                return;
            }
            
            if (this.debugMode) {console.log(`Roof Vision Fade \| Refreshing token ${token.id}`)};  // DEBUG - log the token id
            
            if (this.tilesWithAlsoFade.size > 0 && this.selectedTokens.size > 0) {
                // Update the occlusion modes of tiles based on the token's position
                OcclusionManager.evaluateOcclusion([...RoofVisionFade.tilesWithAlsoFade], [...RoofVisionFade.selectedTokens]);
            }
        });
    }

    /**
     * Adds the Roof Vision Fade UI to the tile configuration.
     * 
     * This function modifies the tile configuration UI to include an additional checkbox
     * for the "also fade" setting, which is shown when the occlusion mode is set to VISION.
     * 
     * @param {Object} app - The application instance.
     * @param {Object} html - The HTML content of the tile configuration.
     * @param {Object} data - The data object for the tile configuration.
     * @returns {Promise<void>} - A promise that resolves when the UI has been updated.
     */
    static async addRoofVisionFadeUI(app, html, data) {
        // get also fade setting for tile
        let alsoFade = await app.object.getFlag(`${MODULENAME}`, FLAGS.ALSOFADE);
        // get the occlusion mode select dropdown
        let select = html.find(`select[name="occlusion.mode"]`);
        
        let showAlsoFadeUI = false;
        if(select[0].value === `${CONST.TILE_OCCLUSION_MODES.VISION}`)
        {
            // show the also fade checkbox on the tile config UI
            showAlsoFadeUI = true;
        }
       
        // add also fade section to the tile congif UI
        select.closest(".form-group").after(
            `<div class="form-group ${MODULENAME}-also-fade ${showAlsoFadeUI ? 'active' : ''}">
                <label>${game.i18n.localize("roof-vision-fade.tile-config.also-fade.name")}</label>
                <div class="form-fields">
                    <input type="checkbox" name="flags.${MODULENAME}.${FLAGS.ALSOFADE}" ${alsoFade ? "checked" : ""} >
                </div>
                <p class="notes">${game.i18n.localize("roof-vision-fade.tile-config.also-fade.description")}</p>
            </div>`
        );
        app.setPosition({height: "auto"});

        // register change event listener for occlusion mode select
        select.on('change', (event) => {
            this.changeOcclusionMode(event, app, html);
        });

    }

    static setTilesWithAlsoFade(tile) {
        if (this.debugMode) {console.log(`Roof Vision Fade \| Updating tile ${tile.id}`)}
        // if the ENABLE_BUTTON_SETTING setting is false, return early
        if (!Settings.getEnabled()) {
            return;
        }
        // if the tile has the 'also fade' flag set
        if (tile.getFlag(MODULENAME, FLAGS.ALSOFADE)) {
            RoofVisionFade.tilesWithAlsoFade.add(tile);
        }
        else {
            RoofVisionFade.tilesWithAlsoFade.delete(tile);
        }
    }

    /**
     * Handles the change of occlusion mode for a tile and updates the UI accordingly.
     *
     * @param {Event} event - The event object triggered by the change.
     * @param {Object} app - The application instance.
     * @param {Object} html - The HTML content of the application.
     *
     * @returns {Promise<void>} - A promise that resolves when the occlusion mode change is complete.
     */
    static async changeOcclusionMode(event, app, html)
    {
        // get also fade UI section on tile config
        let section = html.find(`.${MODULENAME}-also-fade`);

        if(event.target.value === `${CONST.TILE_OCCLUSION_MODES.VISION}`) {
            // show also face UI if occlusion mode is "Vision"
            section.addClass("active");
        }
        else{
            // hide also face UI if occlusion mode is not "Vision"
            section.removeClass("active");
            // clear out the value if occlusion mode is not "Vision"
            let checkbox = html.find(`input[name="flags.${MODULENAME}.${FLAGS.ALSOFADE}"]`);
            checkbox[0].checked = false;
        }

        // resize the tile config box to account for dynamic also fade section
        app.setPosition({height: "auto"});
    }

}