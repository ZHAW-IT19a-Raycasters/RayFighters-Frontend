import { Vec2D } from "../src/common/vec2d";

describe('2D vector methods', () => {
    it('should correctly floor (round) values', () => {
        const pointX: number = 1.11111;
        const pointY: number = 9.99999;
        const point: Vec2D = new Vec2D(pointX, pointY);
        point.floor();
        expect(point.x).toBe(1);
        expect(point.y).toBe(9);
    });
});
