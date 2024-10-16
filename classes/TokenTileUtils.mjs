export class TokenTileUtils {
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
        if (debugMode) {console.log(`Roof Vision Fade \| Checking if token ${token} is under tile`)}; // DEBUG - log the token and tile
        // top right corner of the tile
        let tileTopX = tile.document.x;
        let tileTopY = tile.document.y;
        // Bottom left corner of the tile
        let tileBottomX = tileTopX + tile.document.width;
        let tileBottomY = tileTopY + tile.document.height;
        // Elevation of the tile
        let tileElevation = tile.document.elevation;
        // DEBUG - log the tile coordinates and elevation
        if (debugMode) {console.log(`Roof Vision Fade \| Tile top x: ${tileTopX}, Tile top y: ${tileTopY}, Tile bottom x: ${tileBottomX}, Tile bottom y: ${tileBottomY}, Tile elevation: ${tileElevation}`)};
        // center of the token
        let tokenCenterX = token.document.x + (token.hitArea.width / 2);
        let tokenCenterY = token.document.y + (token.hitArea.height / 2);
        // elevation of the token
        let tokenElevation = token.document.elevation;
        if (debugMode) {console.log(`Roof Vision Fade \| Token center x: ${tokenCenterX}, Token center y: ${tokenCenterY}, Token elevation: ${tokenElevation}`)}; // DEBUG - log the token center and elevation

        // return true if the center of the token is within the bounds of the tile
        let withinBounds = tileTopX <= tokenCenterX && tokenCenterX <= tileBottomX &&
           tileTopY <= tokenCenterY && tokenCenterY <= tileBottomY;
        if (debugMode) {console.log(`Roof Vision Fade \| Token is within bounds: ${withinBounds}`)};  // DEBUG - log if the token is within the bounds of the tile

        if (withinBounds) {
            // return true if the token is under the tile
            let tokenUnderTile = tokenElevation < tileElevation;    
            return tokenUnderTile;
        }
    }
}
