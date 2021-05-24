import { Weapon } from '../src/player/weapon'
import { Image2D } from './image2dmock'

const expectedMuzzleColor = '#FF0000';
const idleImagePath = '../dist/assets/weapon.png';
const shootImage1Path = '../dist/assets/weapon_shoot_1.png';
const shootImage2Path = '../dist/assets/weapon_shoot_2.png';

describe('Test weapon class', () => {
  it('Should have the correct muzzle color and images', () => {
    // Setup
    let w1 = new Weapon(idleImagePath, [shootImage1Path, shootImage2Path], 100, 100, true, 0.4, expectedMuzzleColor, Image2D);
    let w2 = new Weapon(idleImagePath, [shootImage1Path, shootImage2Path], 100, 100, true, 0.4, undefined, Image2D);

    // Test & Verification
    expect(w1.getMuzzleFlashColor).toBe(expectedMuzzleColor);
    expect(w2.getMuzzleFlashColor).toBe(Weapon.DEFAULT_MUZZLE_FLASH_COLOR);
    expect(w1.getCurrentImage2D.source).toBe('../dist/assets/weapon.png');
    w1.update(0.15);
    expect(w1.isMuzzleFlashOngoing).toBe(false);
    expect(w1.getCurrentImage2D.source).toBe('../dist/assets/weapon.png');
  });

  it('should return the correct image', () => {
    // Setup
    const testWeapon = new Weapon(idleImagePath, [shootImage1Path, shootImage2Path], 100, 100, true, 0.4, expectedMuzzleColor, Image2D);

    // Test & Verification
    expect(testWeapon.getCurrentImage2D.source).toBe(idleImagePath);
    testWeapon.shoot();
    expect(testWeapon.getCurrentImage2D.source).toBe(shootImage1Path);
    testWeapon.update(1);
    expect(testWeapon.getCurrentImage2D.source).toBe(shootImage2Path);
  })
});
