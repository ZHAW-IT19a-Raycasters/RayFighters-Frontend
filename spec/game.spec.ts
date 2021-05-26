import { Game, setGameInstance, startGameLoop } from "../src/logic/game"
import { GameHUD } from "./gamehudmock";
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import { Canvas } from "./canvasmock";
import { Packet } from "../src/communication/packet";
import { OpCode } from "../src/communication/opcode";
import { WebSocket } from "./websocketmock";
import { Socket, SocketState } from "../src/communication/socket";

// Setup JSDOM
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator, window } = (new JSDOM(index)).window;
global.document = document;

// Constants
const mockHUD = new GameHUD();
const mockSocket = new Socket('localhost:8000', mockHUD, new WebSocket('localhost'));
const canvas = new Canvas();
const testPacket = new Packet({ opCode: OpCode.SERVER_MAPCHANGE, mapID: 2, time: BigInt(0) });
const testMapPath = 'spec/maps/test_map_2.txt';

// Connection setup
mockSocket.socketState = SocketState.CONNECTED;

// Read from file lambda. Needed for loading a map without XMLHttpRequests.
var readFromFile = (filename: string) => {
    return fs.readFileSync(filename, 'utf8');
}

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
        expect(testGame.getCurrentMapPath).toBeUndefined;
        expect(testGame.getCanvas).toBe(canvas);
        expect(testGame.getCurrentMapPath).toBeUndefined;
        expect(testGame.getPacketToGameLogic).toBeDefined;
    });

    it('should load maps correctly', () => {
        // Setup
        const testGame = new Game('canvas', 'fpscounter', mockHUD, navigator, canvas, window);
        setGameInstance(testGame);
        const testMapNames = new Array<string>(
            "./dist/maps/city_yard.txt",
            "./dist/maps/desert.txt",
            "./dist/maps/sundown_resort.txt",
            "./dist/maps/vapor_land.txt",
            "./dist/maps/weeaboo_city.txt"
        );
        const realMapNames = new Array<string>(
            "maps/city_yard.txt",
            "maps/desert.txt",
            "maps/sundown_resort.txt",
            "maps/vapor_land.txt",
            "maps/weeaboo_city.txt"
        );

        // Test & Verification
        expect(testGame.isMapLoaded()).toBe(false);
        testGame.checkMap(1);
        expect(testGame.isMapLoaded()).toBe(true);
        expect(testGame.initializeRoom(testMapPath, readFromFile)).not.toThrowError;
        
        for (let i = 0; i < testMapNames.length; i++) {
            testGame.getPacketToGameLogic.handlePacket(new Packet({ opCode: OpCode.SERVER_MAPCHANGE, mapID: i, time: BigInt(0) }))
            testGame.checkMap(i);
            testGame.loadMap(testMapNames[i], window, readFromFile);
            expect(testGame.getCurrentMapPath).toBe(realMapNames[i]);
        }

    });

    it('should start the game loop correctly', () => {
        // Setup
        const testGame = new Game('canvas', 'fpscounter', mockHUD, navigator, canvas, window);

        // Test
        setGameInstance(testGame);
        testGame.checkMap(1);
        testGame.initializeRoom(testMapPath, readFromFile);
        testGame.initializeRenderer(window);
        testGame.loadMap(testMapPath, window, readFromFile);
        testGame.getLoop.overrrideSocket(mockSocket);

        // Verification
        expect(testGame.getLoop).toBeDefined;
        expect(testGame.checkConnection()).toBe(true);
        expect(testGame.isMapLoaded()).toBe(true);
        expect(startGameLoop()).not.toThrowError;
        expect(testGame.getLoop.getSocketState).toBe(SocketState.CONNECTED);
        expect(testGame.getPacketToGameLogic.handlePacket(testPacket)).not.toThrowError;
    })
})
