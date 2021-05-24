import { Game, setGameInstance } from "../src/logic/game"
import { GameHUD } from "./gamehudmock";
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import { Canvas } from "./canvasmock";
import { Player } from "../src/player/player";
import { Enemy } from "../src/entities/enemy";
import { Packet } from "../src/communication/packet";
import { OpCode } from "../src/communication/opcode";

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator, window } = (new JSDOM(index)).window;
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
        expect(testGame.checkConnection()).toBe(false);
        expect(testGame.getCanvas).toBe(canvas);
        expect(testGame.getCurrentMapPath).toBeUndefined;
        expect(testGame.getPacketToGameLogic).toBeDefined;
    })
    it('should load maps correctly', () => {
        // Setup
        const testGame = new Game('canvas', 'fpscounter', mockHUD, navigator, canvas, window);
        setGameInstance(testGame);
        const mapPath = 'spec/test_map_2.txt';
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
        expect(testGame.initializeRoom(mapPath)).not.toThrowError;
        
        for (let index = 0; index < 4; index++) {
            testGame.getPacketToGameLogic.handlePacket(new Packet({ opCode: OpCode.SERVER_MAPCHANGE, mapID: index, time: BigInt(0) }))
            testGame.checkMap();
            testGame.loadMap(testMapNames[index], window);
            expect(testGame.getCurrentMapPath).toBe(realMapNames[index]);
        }

    })
})

