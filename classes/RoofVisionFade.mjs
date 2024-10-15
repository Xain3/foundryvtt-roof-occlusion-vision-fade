import { Settings } from "./Settings.mjs";

export const MODULENAME = "dev-roof-occlusion-vision-fade";

const FLAGS = {
    ALSOFADE: 'alsoFade',
    SHOWFADETOGGLE: 'showFadeToggle'
}

// A class that contains the main functionality for the module
export class RoofVisionFade {
    static addRoofVisionFadeModule() {
        Hooks.on('renderTileConfig', (app, html, data) => { 
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_SETTING)) {
                return;
            }

            // Add the UI
            this.addRoofVisionFadeUI(app, html, data);

        });

        Hooks.on('refreshToken', (token) => {
            // if the ENABLE_BUTTON_SETTING setting is false, return early
            if (!game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_SETTING)) {
                return;
            }

            // if the token is owned by the current user and is selected
            if (token.document.isOwner && this.isSelected(token, canvas.tokens.controlled)) {
                let tiles = canvas.tiles.placeables;
                tiles.forEach(tile => {
                // get also fade setting for tile
                let alsoFade = tile.document.getFlag(MODULENAME, FLAGS.ALSOFADE);

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
            // if the token is not owned by the current user
            } else {
                let tiles = canvas.tiles.placeables;
                tiles.forEach(tile => {
                    // get also fade setting for tile
                    let alsoFade = tile.document.getFlag(MODULENAME, FLAGS.ALSOFADE);

                    if (alsoFade) {
                            let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.VISION } };
                            tile.document.update(occlusion);
                        }
                    });
                }
        });
    }

    static isSelected(token, selectedTokens) {
        for (let selectedToken of selectedTokens) {
            if (selectedToken.document.id === token.id) {
                return true;
            }
        }
        return false;
    }

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