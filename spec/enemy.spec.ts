import { Vec2D } from "../src/common/vec2d";
import { Enemy } from "../src/entities/enemy";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import { PlayerInfo } from "../src/communication/playerinfo";
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;

let testEntity: Enemy;
const testAngle = 5.5;
const testX = 99;
const testY = 88;
const testPosition = new Vec2D(testX, testY);

describe('Enemy unit test', () => {
    it('should instantiate enemy entities correctly', () => {
        testEntity = new Enemy();
        testEntity.setAngle = testAngle;
        testEntity.setPosition = testPosition;
        expect(testEntity.getAngle).toBe(testAngle);
        expect(testEntity.getPosition.x).toBe(testPosition.x);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
    })

    it('should move enemies correctly', () => {
        const seconds = 10;
        testEntity = new Enemy();
        testEntity.setPosition = testPosition;
        testEntity.update(seconds);
        expect(testEntity.getPosition.x).toBe(testPosition.x);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
        testEntity.walk();
        testEntity.update(seconds);
        expect(testEntity.getPosition.x).toBeCloseTo(testX);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
    })
/*
    it('should return the correct sprite set after turning', () => {
        testEntity = new Enemy();
        const testPlayerInfo = new PlayerInfo({isDead: false});
        testEntity.setPlayerInfo = testPlayerInfo;
        testEntity.setPosition = testPosition;
        testEntity.setAngle = 0;
        const baseAssetPath = "assets/enemies/female/";
        const turningAngle = Math.PI / 2;

        for (let entry of new Array<string>("front_0.png", "side_r_0.png", "back_0.png", "side_l_0.png")) {
            testEntity.update(1);
            expect(testEntity.getSprite().source).toBe(baseAssetPath + entry);
            testEntity.setAngle = testEntity.getAngle + turningAngle;
        };
    })*/
    
})
