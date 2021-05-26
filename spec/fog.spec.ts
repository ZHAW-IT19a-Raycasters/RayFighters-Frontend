import { Fog } from "../src/rendering/fog";

describe('Fog methods', () => {
    it('should initiate a fog', () => {
        // Setup
        const color: string = "#AAAAAA";
        const distance: number = 32;
        const engageNegative: number = 2;
        const engagePositive: number = 0.5;

        // Test
        let fog: Fog = new Fog(color, distance, engagePositive);

        // Verification
        expect(fog.color).toBe(color);
        expect(fog.distance).toBe(distance);
        expect(fog.engage).toBe(engagePositive);

        // Test
        fog = new Fog(color, distance, engageNegative);

        // Verification
        expect(fog.color).toBe(color);
        expect(fog.distance).toBe(distance);
        expect(fog.engage).toBe(1);
    });
});
