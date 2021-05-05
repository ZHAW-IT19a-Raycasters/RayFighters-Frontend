import { Weapon } from '../src/player/weapon'
import { Image2D } from './image2dmock'

describe('Test weapon class', () => {
  it('Should have the correct muzzle color and images', () => {
      const expectedMuzzleColor = '#FF0000';
      let w1 = new Weapon('../dist/assets/weapon.png', ['../dist/assets/weapon_shoot_1.png', '../dist/assets/weapon_shoot_2.png'], 100, 100, true, 0.4, expectedMuzzleColor, Image2D);
      let w2 = new Weapon('../dist/assets/weapon.png', ['../dist/assets/weapon_shoot_1.png', '../dist/assets/weapon_shoot_2.png'], 100, 100, true, 0.4,  undefined, Image2D);
      expect(w1.getMuzzleFlashColor).toBe(expectedMuzzleColor);
      expect(w2.getMuzzleFlashColor).toBe(Weapon.DEFAULT_MUZZLE_FLASH_COLOR);
      expect(w1.getCurrentImage2D.source).toBe('../dist/assets/weapon.png');
      w1.update(0.15);
      expect(w1.isMuzzleFlashOngoing).toBe(false);
      expect(w1.getCurrentImage2D.source).toBe('../dist/assets/weapon.png');
  });
});
