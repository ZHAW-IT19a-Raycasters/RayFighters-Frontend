import { Fog } from "../src/rendering/fog";

describe('Fog methods', () => {
    it('should initiate a fog', () => {
        const color: string = "#AAAAAA";
        const distance: number = 32;
        const engageNegative: number = 2;
        const engagePositive: number = 0.5;
        let fog: Fog = new Fog(color, distance, engagePositive);

        expect(fog.color).toBe(color);
        expect(fog.distance).toBe(distance);
        expect(fog.engage).toBe(engagePositive);

        fog = new Fog(color, distance, engageNegative);
        expect(fog.color).toBe(color);
        expect(fog.distance).toBe(distance);
        expect(fog.engage).toBe(1);
    });
});
