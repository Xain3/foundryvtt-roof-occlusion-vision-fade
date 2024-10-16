import { TokenTileUtils } from "./TokenTileUtils.mjs";

/**
 * The OcclusionManager class provides methods to evaluate and set the occlusion of tiles based on the positions of tokens.
 * 
 * @class
 * @classdesc This class contains static methods to handle the occlusion logic for tiles in a game environment.
 * 
 * @example
 * // Example usage:
 * const tiles = [...]; // Array of tile objects
 * const tokens = [...]; // Array of token objects
 * OcclusionManager.evaluateOcclusion(tiles, tokens);
 */
export class OcclusionManager {
   
    /**
     * Evaluates the occlusion of tiles based on the positions of tokens.
     * 
     * @param {Array} tiles - An array of tile objects to be evaluated.
     * @param {Array} tokens - An array of token objects to check against the tiles.
     * @static
     */
    static evaluateOcclusion(tiles, tokens) {
        // If the tiles or tokens are empty, return early
        if (!tiles || !tokens) {
            return
        }
        // Iterate over each tile and token to determine occlusion
        for (let tile of tiles) {
            // Check if the token is under the tile
             for (let token of tokens) {
                if(TokenTileUtils.isUnderTile(tile, token)) {
                    this.setOcclusionMode(tile, CONST.TILE_OCCLUSION_MODES.FADE);  // Set the occlusion mode to fade
                }
                else {
                    this.setOcclusionMode(tile, CONST.TILE_OCCLUSION_MODES.VISION);  // Set the occlusion mode to none
                }
                // If the tile is occluded, break out of the loop
                 break;
            }
        }
    };

    /**
     * Sets the occlusion mode for a given tile.
     *
     * @param {Object} tile - The tile object whose occlusion mode is to be set.
     * @param {string} mode - The occlusion mode to set for the tile.
     */
    static setOcclusionMode(tile, mode) {
        let occlusion = { occlusion : { mode : mode } };
        tile.document.update(occlusion);
    }
}