import { MathHelper } from "../src/common/mathhelper";
import { Vec2D } from "../src/common/vec2d"

describe("Math helper module test", () => {
    it("should calculate euclidean distance correctly.", () => {
        const point1: Vec2D = new Vec2D(12, 20);
        const point2: Vec2D = new Vec2D(3, 9);
        const zeroVector: Vec2D = new Vec2D(0,0);
        expect(MathHelper.euclideanDistance(zeroVector, zeroVector)).toBe(0);
        expect(MathHelper.euclideanDistance(point1, point2)).toBeCloseTo(14.21267);
    })

    it("should determine if an object is in view", () => {
        const origin: Vec2D = new Vec2D(0, 0);
        const positiveTarget: Vec2D = new Vec2D(0, 3);
        const negativeTarget: Vec2D = new Vec2D(0, -3);
        const angle: number = 0;
        const fov: number = 45;
        expect(MathHelper.vectorInViewCheck(origin, angle, positiveTarget, fov)).toBeTrue;
        expect(MathHelper.vectorInViewCheck(origin, angle, negativeTarget, fov)).toBeFalse;
    })
})