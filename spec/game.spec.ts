import { Game } from "../src/logic/game"
import { GameHUD } from "./gamehudmock";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import canvasmock from "./canvasmock.js";

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;
var Canvas = document.createElement('canvas');
Canvas.id = 'canvas';
canvasmock(Canvas); 

const mockHUD = new GameHUD();

describe('Game module test', () => {
    /*
    it('should instantiate the game correctly', () => {
        const testGame = new Game('canvas', 'fpscounter', mockHUD);
        expect(testGame.checkConnection()).toBe(false);
        expect(testGame.getGameHUD).toBeDefined;
        expect(testGame.getControls).toBeDefined; 
        expect(testGame.getRoom).toBeDefined;
        expect(testGame.getPlayer).toBeDefined;
        expect(testGame.getPlayer.getPosition.x).toBe(0);
        expect(testGame.getPlayer.getPosition.y).toBe(0);
        expect(testGame.getLoop).toBeDefined;
        expect(testGame.getRenderer).toBeDefined;
        expect(testGame.getMapPath).toBeUndefined;
    })
*/

})
