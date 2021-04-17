import { Controls, KeyCodes } from "../src/controls";
import { Map2D } from "../src/map2d";
import { Player } from "../src/player";

describe('Player module testing', () => {
  it('Player rotates by 90 degree', () => {
    let player = new Player(0, 0, 0);
    player.rotate(Math.PI / 2); // (0 + Math.PI/2 + Math.PI*2) % (Math.PI*2)
    expect(player.getDirection).toBe(Math.PI / 2);
  });

  /*
  it('Set the current Weapon of the Player to Knife_hand', () => {
    let player = new Player(0, 0, 0);
    player.setWeapon('./assets/weapons/knife_hand.png', 319, 320);
    expect(player.getcurrWeapon.source).toBe('./assets/weapons/knife_hand.png');
  });
  */

  it('Player rotates to the left and walks forward for 3 seconds', () => {
    let player = new Player(0, 0, 0);
    let map = new Map2D(32);
    let controls = new Controls();
    controls.states.set(KeyCodes.FORWARD, true);
    controls.states.set(KeyCodes.TURN_LEFT, true);
    const seconds = 3;
    player.update(controls, map, seconds);

    expect(player.getDirection).toBeCloseTo(-Math.PI);
    expect(player.getPosition.x).toBeCloseTo(-seconds * Player.DEFAULT_WALK_SPEED);
    expect(player.getPosition.y).toBeCloseTo(0);
  });

});