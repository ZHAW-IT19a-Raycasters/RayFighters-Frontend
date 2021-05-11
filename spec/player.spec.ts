import { Controls, KeyCodes } from "../src/player/controls";
import { Map2D } from "../src/maps/map2d";
import { Player } from "../src/player/player";
import { Packet } from "../src/communication/packet";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import { Weapon } from "../src/player/weapon";
import { Vec2D } from "../src/common/vec2d";
import { Sound } from "../src/sound/sound";
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, Audio, HTMLAudioElement, Image } = (new JSDOM(index)).window;
global.document = document;
//Sound.get.setAudio = Audio;

describe('Player module testing', () => {
  it('should instantiate the player correctly', () => {
    const testWeapon = new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4);
    const testPosition = new Vec2D(6,9);
    const testAngle = 6.9;
    const testSpeed = 1;
    let player = new Player(testPosition.x, testPosition.y, testAngle, testWeapon, testSpeed);
    expect(player.getPosition.x).toBe(testPosition.x);
    expect(player.getPosition.y).toBe(testPosition.y);
    expect(player.getDirection).toBe(testAngle);
    expect(player.getWalkSpeed).toBe(testSpeed);
    expect(player.getWeapon).toBe(testWeapon);
    expect(player.isDead).toBe(false);
    expect(player.getPlayerInfo).toBeUndefined;
  });
  
  it('should rotate the player by 90 degrees', () => {
    let player = new Player(0, 0, 0);
    player.rotate(Math.PI / 2); // (0 + Math.PI/2 + Math.PI*2) % (Math.PI*2)
    expect(player.getDirection).toBe(Math.PI / 2);
  });

  it('should rotate the player to the left and walks forward for 3 seconds, then rotates player to the right and walks forward for 3 seconds', () => {
    let player = new Player(0, 0, 0);
    let map = new Map2D(32);
    let controls = new Controls();
    let dummyCallback = function (p: Packet) { /* no implementation needed */ };
    controls.states.set(KeyCodes.FORWARD, true);
    controls.states.set(KeyCodes.TURN_LEFT, true);
    const seconds = 3;
    player.update(controls, map, seconds, dummyCallback);

    expect(player.getDirection).toBeCloseTo(-Math.PI);
    expect(player.getPosition.x).toBeCloseTo(-seconds * Player.DEFAULT_WALK_SPEED);
    expect(player.getPosition.y).toBeCloseTo(0);

    controls.states.set(KeyCodes.TURN_RIGHT, true);

    player.update(controls, map, seconds, dummyCallback);

    expect(player.getDirection).toBeCloseTo(Math.PI);
    expect(player.getPosition.x).toBeCloseTo(-seconds * Player.DEFAULT_WALK_SPEED);
    expect(player.getPosition.y).toBeCloseTo(0);
  });
});