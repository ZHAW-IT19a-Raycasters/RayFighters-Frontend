import { Vec2D } from "../src/common/vec2d";
import { Enemy } from "../src/entities/enemy"
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;

describe('Entity unit test', () => {
    it('should instantiate an entity object correctly', () => {
        const testEntity = new Enemy();
        const testAngle = 5.5;
        const testX = 99;
        const testY = 88;
        const testPosition = new Vec2D(testX, testY);
        testEntity.setAngle = testAngle;
        testEntity.setPosition = testPosition;
        expect(testEntity.getAngle).toBe(testAngle);
        expect(testEntity.getPosition.x).toBe(testPosition.x);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
    })
})