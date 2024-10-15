import { Settings } from "./Settings.mjs";

export const MODULENAME = "dev-roof-occlusion-vision-fade";

const FLAGS = {
    ALSOFADE: 'alsoFade',
    SHOWFADETOGGLE: 'showFadeToggle'
}

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
    static addRoofVisionFadeModule() {
        
        // Add the Roof Vision Fade module
        Hooks.on('renderTileConfig', (app, html, data) => { 
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_SETTING)) {
                return;
            }

            // Add the UI
            this.addRoofVisionFadeUI(app, html, data);

        });

        // Update tile occlusion modes based on token ownership and position
        Hooks.on('refreshToken', (token) => {
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_SETTING)) {
                return;
            }

            // if the token is owned by the current user and is selected
            if (token.document.isOwner && this.isSelected(token, canvas.tokens.controlled)) {
                // get all tiles on the canvas
                let tiles = canvas.tiles.placeables;
                tiles.forEach(tile => {
                    // get 'also fade' setting for tile
                let alsoFade = tile.document.getFlag(MODULENAME, FLAGS.ALSOFADE);

                    // update the tile occlusion mode based on token position if 'also fade' is enabled
                    if (alsoFade) {
                        if(this.isUnderTile(tile, token)) {
                            let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.FADE } };
                            tile.document.update(occlusion);
                        }
                        else {
                            let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.VISION } };
                            tile.document.update(occlusion);
                        }
                    }});
            
            // if the token is not owned by the current user or is not selected
            } else {
                let tiles = canvas.tiles.placeables;
                tiles.forEach(tile => {
                    // get 'also fade' setting for tile
                    let alsoFade = tile.document.getFlag(MODULENAME, FLAGS.ALSOFADE);

                    // ensure that the tile occlusion mode is set to 'Vision' if the token is not owned by the current user or is not selected
                    if (alsoFade) {
                            let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.VISION } };
                            tile.document.update(occlusion);
                        }
                    });
                }
        });
    }

    /**
     * Checks if a given token is in the list of selected tokens.
     *
     * @param {Object} token - The token to check.
     * @param {Array<Object>} selectedTokens - The list of selected tokens.
     * @returns {boolean} - Returns true if the token is in the list of selected tokens, otherwise false.
     */
    static isSelected(token, selectedTokens) {
        for (let selectedToken of selectedTokens) {
            if (selectedToken.document.id === token.id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if a token is under a tile.
     *
     * @param {Object} tile - The tile object.
     * @param {Object} tile.document - The document of the tile.
     * @param {number} tile.document.x - The x-coordinate of the top-left corner of the tile.
     * @param {number} tile.document.y - The y-coordinate of the top-left corner of the tile.
     * @param {number} tile.document.width - The width of the tile.
     * @param {number} tile.document.height - The height of the tile.
     * @param {number} tile.document.elevation - The elevation of the tile.
     * @param {Object} token - The token object.
     * @param {Object} token.document - The document of the token.
     * @param {number} token.document.x - The x-coordinate of the top-left corner of the token.
     * @param {number} token.document.y - The y-coordinate of the top-left corner of the token.
     * @param {number} token.document.elevation - The elevation of the token.
     * @param {Object} token.hitArea - The hit area of the token.
     * @param {number} token.hitArea.width - The width of the token's hit area.
     * @param {number} token.hitArea.height - The height of the token's hit area.
     * @returns {boolean} - Returns true if the token is under the tile, otherwise false.
     */
    static isUnderTile(tile, token) {
        // top right corner of the tile
        let tileTopX = tile.document.x;
        let tileTopY = tile.document.y;
        // Bottom left corner of the tile
        let tileBottomX = tileTopX + tile.document.width;
        let tileBottomY = tileTopY + tile.document.height;
        // Elevation of the tile
        let tileElevation = tile.document.elevation;
        // center of the token
        let tokenCenterX = token.document.x + (token.hitArea.width / 2);
        let tokenCenterY = token.document.y + (token.hitArea.height / 2);
        // elevation of the token
        let tokenElevation = token.document.elevation;

        // return true if the center of the token is within the bounds of the tile
        let withinBounds = tileTopX <= tokenCenterX && tokenCenterX <= tileBottomX &&
           tileTopY <= tokenCenterY && tokenCenterY <= tileBottomY;
        if (withinBounds) {
            // return true if the token is under the tile
            let tokenUnderTile = tokenElevation < tileElevation;    
            return tokenUnderTile;
        }
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