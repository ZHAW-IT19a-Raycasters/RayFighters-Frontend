import { Vec2D } from "../src/common/vec2d";

describe('2D vector methods', () => {
    it('should correctly floor (round) values', () => {
        // Setup
        const pointX: number = 1.11111;
        const pointY: number = 9.99999;
        const point: Vec2D = new Vec2D(pointX, pointY);

        // Test
        point.floor();

        // Verification
        expect(point.x).toBe(1);
        expect(point.y).toBe(9);
    });

    it('should create strings out of vectors correctly', () => {
        // Setup
        const pointX: number = 1.11111;
        const pointY: number = 9.99999;
        const point: Vec2D = new Vec2D(pointX, pointY);

        // Test & Verification
        expect(point.toString()).toBe('(' + pointX.toString() + ', ' + pointY.toString() + ')')
    })

    it('should normalize vectors correctly', () => {
        // Setup
        const testVector: Vec2D = new Vec2D(4,5);

        // Test & Verification
        expect(testVector.getNormalized.x).toBeCloseTo(0.62);
        expect(testVector.getNormalized.x).toBeCloseTo(0.62);
    })
});
