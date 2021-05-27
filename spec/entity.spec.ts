import { Vec2D } from "../src/common/vec2d";
import { Enemy } from "../src/entities/enemy"

describe('Entity module testing', () => {
    it('should instantiate an entity object correctly', () => {
        // Setup
        const testEntity = new Enemy();
        const testAngle = 5.5;
        const testX = 99;
        const testY = 88;
        const testPosition = new Vec2D(testX, testY);

        // Test
        testEntity.setAngle = testAngle;
        testEntity.setPosition = testPosition;

        // Verification
        expect(testEntity.getAngle).toBe(testAngle);
        expect(testEntity.getPosition.x).toBe(testPosition.x);
        expect(testEntity.getPosition.y).toBe(testPosition.y);
    })
})