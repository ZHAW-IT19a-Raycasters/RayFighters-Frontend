import { Game } from "../src/logic/game"
import { GameHUD } from "./gamehudmock";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import canvasmock from "./canvasmock";

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;
var jsdom = require("jsdom").jsdom;
var window = jsdom().defaultView;
var Canvas = window.document.createElement('canvas');
canvasmock(Canvas); 


const mockHUD = new GameHUD();

describe('Game module test', () => {
    /*it('should instantiate the game correctly', () => {
        const testGame = new Game('nothing', 'nothing', mockHUD);
        expect(testGame.checkConnection()).toBe(false);
    })*/
})