import { Vec2D } from "../src/common/vec2d";
import { Enemy } from "../src/entities/enemy";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import { PlayerInfo } from "../src/communication/playerinfo";

// JSDOM Setup
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;

// Variables
let testEntity: Enemy;

// Constants
const testAngle = 5.5;
const testX = 99;
const testY = 88;
const testPosition = new Vec2D(testX, testY);
const seconds = 10;

function resetEnemyPosition() {
    testEntity.setPosition = testPosition;
    testEntity.setAngle = 0;
    testEntity.lastPlayerViewingAngle = 0;
}

describe('Enemy unit test', () => {
    it('should instantiate enemy entities correctly', () => {
        // Setup
        testEntity = new Enemy();
        testEntity.setAngle = testAngle;
        testEntity.setPosition = testPosition;

        // Verification
        expect(testEntity.getAngle).toBe(testAngle);
        expect(testEntity.getPosition.x).toBe(testPosition.x);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
    })

    it('should move enemies correctly', () => {
        // Setup
        testEntity = new Enemy();
        testEntity.setPosition = testPosition;

        // Test
        testEntity.update(seconds);

        // Verification
        expect(testEntity.getPosition.x).toBe(testPosition.x);
        expect(testEntity.getPosition.y).toBe(testPosition.y);

        // Test
        testEntity.walk();
        testEntity.update(seconds);

        // Verification
        expect(testEntity.getPosition.x).toBeCloseTo(testX);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
    })

    it('should return the correct sprite set after turning', () => {
        // Setup
        testEntity = new Enemy();
        const testPlayerInfo = new PlayerInfo({isDead: false});
        testEntity.setPlayerInfo = testPlayerInfo;
        resetEnemyPosition();
        const baseAssetPath = "assets/enemies/female/";
        const turningAngle = Math.PI / 2;

        for (let entry of new Array<string>("back_0.png", "side_l_0.png", "front_0.png", "side_r_0.png")) {
            // Test
            testEntity.update(1);
            
            // Verification
            expect(testEntity.getSprite().source).toBe(baseAssetPath + entry);
            
            // Turn enemy 90°
            testEntity.setAngle = testEntity.getAngle + turningAngle;
        }

        resetEnemyPosition();
        testEntity.cycleSpriteState();

        for (let entry of new Array<string>("back_1.png", "side_l_1.png", "front_1.png", "side_r_1.png")) {
            // Test
            testEntity.update(1);
            
            // Verification
            expect(testEntity.getSprite().source).toBe(baseAssetPath + entry);
            testEntity.setAngle = testEntity.getAngle + turningAngle;
        }

        resetEnemyPosition();
        testEntity.cycleSpriteState();

        for (let entry of new Array<string>("back_0.png", "side_l_0.png", "front_0.png", "side_r_0.png")) {
            // Test
            testEntity.update(1);
            
            // Verification
            expect(testEntity.getSprite().source).toBe(baseAssetPath + entry);
            
            // Turn enemy 90°
            testEntity.setAngle = testEntity.getAngle + turningAngle;
        }

        resetEnemyPosition();
        testEntity.cycleSpriteState();

        for (let entry of new Array<string>("back_2.png", "side_l_2.png", "front_2.png", "side_r_2.png")) {
            // Test
            testEntity.update(1);
            
            // Verification
            expect(testEntity.getSprite().source).toBe(baseAssetPath + entry);
            
            // Turn enemy 90°
            testEntity.setAngle = testEntity.getAngle + turningAngle;
        }
    });

    it('should handle enemy shooting correctly', () => {
        // Setup
        testEntity = new Enemy();
        const testPlayerInfo = new PlayerInfo({isDead: false});
        testEntity.setPlayerInfo = testPlayerInfo;
        resetEnemyPosition();

        // Test
        testEntity.shoot(new Vec2D(-1, -1));

        // Verification
        expect(testEntity.getShot).toBe(true);
    })
})
