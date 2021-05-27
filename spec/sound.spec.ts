import { Sound, SoundType } from "../src/sound/sound";

describe('Sound module testing', () => {
    it('the instance should not be undefined', () => {
        // Test & Verification
        expect(Sound.get).not.toBeUndefined;
    })

    it('should play sounds without exception', () => {
        // Setup
        let volumes = [1, 0.5, 0, -0.5, -1];

        // Test & Verification
        for (let volume of volumes) {
            expect(Sound.get.play(SoundType.SHOOT, volume)).not.toThrowError;
            expect(Sound.get.play(SoundType.STEP, volume)).not.toThrowError;
            expect(Sound.get.play(SoundType.DEATH, volume)).not.toThrowError;
        }
    });

    it('should calculate distance to volume correctly', () => {
        // Test & Verification
        expect(Sound.get.distanceToVolume(0)).toBeCloseTo(1);
        expect(Sound.get.distanceToVolume(0.1)).toBeCloseTo(1);
        expect(Sound.get.distanceToVolume(0.5)).toBeCloseTo(1);
        expect(Sound.get.distanceToVolume(1)).toBe(1);
        expect(Sound.get.distanceToVolume(10000)).toBeLessThan(1);
    })
});