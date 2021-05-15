import { Sound, SoundType } from "../src/sound/sound";

describe('Sound module testing', () => {
    it('s instance shouldnt be undefined', () => {
        expect(Sound.get).not.toBeUndefined;
    })

    it('should play sounds without exception', () => {
        let volumes = [1, 0.5, 0, -0.5, -1];
        for (let volume of volumes) {
            expect(Sound.get.play(SoundType.SHOOT, volume)).not.toThrowError;
            expect(Sound.get.play(SoundType.STEP, volume)).not.toThrowError;
            expect(Sound.get.play(SoundType.DEATH, volume)).not.toThrowError;
        }
    });

    it('should calculate distance to volume correctly', () => {
        expect(Sound.get.distanceToVolume(0)).toBeCloseTo(1);
        expect(Sound.get.distanceToVolume(0.1)).toBeCloseTo(1);
        expect(Sound.get.distanceToVolume(0.5)).toBeCloseTo(1);
        expect(Sound.get.distanceToVolume(1)).toBe(1);
        expect(Sound.get.distanceToVolume(10000)).toBeLessThan(1);
    })
});