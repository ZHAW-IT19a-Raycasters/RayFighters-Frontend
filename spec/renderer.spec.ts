import { JSDOM } from "jsdom";
import { Canvas } from "./canvasmock";
import { GameHUD } from "./gamehudmock";
import * as fs from 'fs';
import { ColorGradient, Renderer } from "../src/rendering/renderer";
import { Room } from "../src/maps/room";
import { setupPlayer } from "./player.spec";
import { Vec2D } from "../src/common/vec2d";
import { Enemy } from "../src/entities/enemy";
import { PlayerInfo } from "../src/communication/playerinfo";

// Setup JSDOM
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator, window } = (new JSDOM(index)).window;
global.document = document;

// Variables
let canvas: Canvas;

// Constants
const mockHUD = new GameHUD();
const testMapPath = 'spec/maps/test_map_2.txt';
const resolution = 1024;
const drawDistance = 32;
const focal = 2;
const gradient = new ColorGradient('#000000', '#FFFFFF');
const minImagesExpected = 513;
const maxImagesExpected = 514;
const expectedSaveAndRestoreCount = 3;

// Read from file lambda. Needed for loading a map without XMLHttpRequests.
var readFromFile = (filename: string) => {
    return fs.readFileSync(filename, 'utf8');
}

describe('Renderer unit test', () => {
    beforeEach(() => {
        canvas = new Canvas();
    });

    it('should change the resolution correctly', () => {
        // Setup
        const testRender = new Renderer(canvas, resolution, drawDistance, focal, gradient, gradient, window);
        const resolutionDelta = 2;

        // Test
        testRender.changeResolution(resolutionDelta);

        // Verification
        expect(testRender.getResolution).toBe(resolution);

        // Test
        testRender.changeResolution(- 2 * resolutionDelta);

        // Verification
        expect(testRender.getResolution).toBe(resolution - 2 * resolutionDelta);
    });

    it('should be able to do one render procedure without errors on an empty map', () => {
        // Setup
        const testRender = new Renderer(canvas, resolution, drawDistance, focal, gradient, gradient, window);
        const testRoom = new Room({ mapSize: 2 }); // Create empty map
        testRoom.updateEnemyEntities(new Array<Enemy>());
        const testPlayer = setupPlayer(new Vec2D(0, 0), 0);

        // Test 
        expect(testRender.render(testRoom, testPlayer, 1)).not.toThrowError;

        // Verification
        expect(canvas.getContext().drawImageCount).toBe(1);
        expect(canvas.getContext().drawGradientCount).toBe(2);
        expect(canvas.getContext().saveCount).toBe(expectedSaveAndRestoreCount);
        expect(canvas.getContext().restoreCount).toBe(expectedSaveAndRestoreCount);
    })

    it('should be able to do one render procedure without errors on a full map', () => {
        // Setup
        const testRender = new Renderer(canvas, resolution, drawDistance, focal, gradient, gradient, window);
        const testRoom = new Room({ mapSize: 32, loadMap: testMapPath, readFromFile: readFromFile }); // Load map
        testRoom.updateEnemyEntities(new Array<Enemy>());
        const testPlayer = setupPlayer(new Vec2D(0, 0), 0);

        // Test
        expect(testRender.render(testRoom, testPlayer, 1)).not.toThrowError;

        // Verification
        expect(canvas.getContext().drawImageCount).toBeGreaterThanOrEqual(minImagesExpected);
        expect(canvas.getContext().drawImageCount).toBeLessThanOrEqual(maxImagesExpected);
        expect(canvas.getContext().drawGradientCount).toBe(2);
        expect(canvas.getContext().saveCount).toBe(expectedSaveAndRestoreCount);
        expect(canvas.getContext().restoreCount).toBe(expectedSaveAndRestoreCount);
    })

    it('should be able to do one render procedure with enemy sprites without errors on an empty map', () => {
        // Setup
        const testRender = new Renderer(canvas, resolution, drawDistance, focal, gradient, gradient, window);
        const testRoom = new Room({ mapSize: 2 }); // Create empty map
        const testEnemy = new Enemy();
        testEnemy.setPlayerInfo = new PlayerInfo({userID: 1, userName: "Glünggi", isDead: false });
        testEnemy.setPosition = new Vec2D(1, 1);
        testRoom.updateEnemyEntities(new Array<Enemy>(testEnemy));
        testRoom.updateEnemies(0);
        const testPlayer = setupPlayer(new Vec2D(0, 0), 0);

        // Test 
        expect(testRender.render(testRoom, testPlayer, 1)).not.toThrowError;

        // Verification
        expect(canvas.getContext().drawImageCount).toBe(1);
        expect(canvas.getContext().drawGradientCount).toBe(2);
        expect(canvas.getContext().saveCount).toBe(expectedSaveAndRestoreCount);
        expect(canvas.getContext().restoreCount).toBe(expectedSaveAndRestoreCount);
    })

    it('should show the death screen without errors', () => {
        // Setup
        const testRender = new Renderer(canvas, resolution, drawDistance, focal, gradient, gradient, window);

        // Test 
        expect(testRender.deathScreen()).not.toThrowError;

        // Verification
        expect(canvas.getContext().drawImageCount).toBe(0);
        expect(canvas.getContext().saveCount).toBe(0);
        expect(canvas.getContext().restoreCount).toBe(0);
    })
})