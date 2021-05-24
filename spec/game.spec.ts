import { Game } from "../src/logic/game"
import { GameHUD } from "./gamehudmock";
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import { Canvas } from "./canvasmock";

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator, window} = (new JSDOM(index)).window;
global.document = document;

const mockHUD = new GameHUD();
const canvas = new Canvas();

describe('Game module test', () => {
    it('should instantiate the game correctly', () => {
        const testGame = new Game('canvas', 'fpscounter', mockHUD, navigator, canvas, window);
        expect(testGame.checkConnection()).toBe(false);
        expect(testGame.getGameHUD).toBeDefined;
        expect(testGame.getControls).toBeDefined; 
        expect(testGame.getRoom).toBeDefined;
        expect(testGame.getPlayer).toBeDefined;
        expect(testGame.getPlayer.getPosition.x).toBe(6);
        expect(testGame.getPlayer.getPosition.y).toBe(6);
        expect(testGame.getLoop).toBeDefined;
        expect(testGame.getRenderer).toBeDefined;
        expect(testGame.getMapPath).toBeUndefined;
    })
})
