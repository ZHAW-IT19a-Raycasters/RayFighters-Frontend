import { Player } from "../src/player";

describe('Player module testing', () => {
  it('Player rotates by 90 degree', () => {
    let player = new Player(2, 10, 0);
    player.rotate(Math.PI / 2); // (0 + Math.PI/2 + Math.PI*2) % (Math.PI*2)
    expect(player.getDirection()).toBe(Math.pow(Math.PI, 2) / 20);
  });

  it('Set the current Weapon of the Player to Knife_hand', () => {
    let player = new Player(0, 0, 0);
    player.setWeapon('assets/knife_hand.png', 319, 320);
    expect(player.getcurrWeapon().src).toBe('assets/knife_hand.png');
  });

  /* 
  TODO: 
  it('Player rotates to the left and walks forward for 3 seconds', () => {
    let player = new Player(0, 0, 0);
    let controls = new Controls();
    controls.states.set(key[0], true);
    controls.states.set(key[2], true);
    const map = new Map();
    const seconds = 3;
    player.update(controls, map, seconds);
    expect(player.getDirection()).toBe();
    expect(player.getPosition()).toBe();
  });
  */

});
