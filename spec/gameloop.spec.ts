import { GameLoop } from "../src/logic/gameloop"
import { GameHUD } from "./gamehudmock";
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import { Game } from "../src/logic/game";
import { Canvas } from "./canvasmock";
import { Socket } from "../src/communication/socket";
import { WebSocket } from "./websocketmock";

// Setup JSDOM
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator, window } = (new JSDOM(index)).window;
global.document = document;

// Constants
const dummyCallback = function () { return; }
const mockHUD = new GameHUD();
const canvas = new Canvas();
const mockSocket = new Socket('localhost:8000', mockHUD, new WebSocket('localhost'));

// Variables
var testLoop: GameLoop;

beforeEach(() => {
    const testGame = new Game('canvas', 'fpscounter', mockHUD, navigator, canvas, window);
    testLoop = testGame.getLoop;
});

describe('GameLoop unit test', () => {
    it('should begin a game loop correctly', () => {
        // Test & Verification
        expect(testLoop.begin(dummyCallback)).not.toThrowError;
    })

    it('should execute a frame correctly', () => {
        // Setup
        testLoop.begin(dummyCallback);

        // Test
        testLoop.frame(1);

        // Verification
        expect(testLoop.getSocket.getReceived.length).toBe(0);
    })
})