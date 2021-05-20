import { loadPage } from "..";

/**
 * Helper methods for game logic.
 */
export abstract class LogicHelper {
    constructor() { /* deliberately empty */ }

    /**
     * Stops the game and returns the player to the landing page.
     */
    public static exitGame() {
        if (typeof process === 'undefined') {
            loadPage('./index.html');
        }
    }
}