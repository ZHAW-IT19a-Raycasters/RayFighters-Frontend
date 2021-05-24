import { Controls, KeyCodes } from "../src/player/controls";
import { Map2D } from "../src/maps/map2d";
import { Player } from "../src/player/player";
import { Packet } from "../src/communication/packet";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import { Weapon } from "../src/player/weapon";
import { Vec2D } from "../src/common/vec2d";
import { GameHUD } from "./gamehudmock";
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator } = (new JSDOM(index)).window;
global.document = document;
const HUDmock = new GameHUD();

const testPosition = new Vec2D(6, 9);
const testAngle = 6.9;
const testSpeed = 1;
const testWeapon = new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4);
const dummyCallback = function (p: Packet) { /* no implementation needed */ };

function setupPlayer(position: Vec2D, angle: number) {
  return new Player(position.x, position.y, angle, HUDmock, testWeapon, 1);
}

var readFromFile = (filename: string) => {
  return fs.readFileSync(filename, 'utf8');
}

describe('Player module testing', () => {
  it('should instantiate the player correctly', () => {
    const player = setupPlayer(testPosition, testAngle);
    expect(player.getPosition.x).toBe(testPosition.x);
    expect(player.getPosition.y).toBe(testPosition.y);
    expect(player.getDirection).toBe(testAngle);
    expect(player.getWalkSpeed).toBe(testSpeed);
    expect(player.getWeapon).toEqual(testWeapon);
    expect(player.isDead).toBe(false);
    expect(player.getPlayerInfo).toBeUndefined;
  });

  it('should react to controls correctly', () => {
    const player = setupPlayer(new Vec2D(1, 1), 0);
    let controls = new Controls(navigator);
    const inputs = new Array<KeyCodes>(
      KeyCodes.FORWARD,
      KeyCodes.BACKWARD,
      KeyCodes.STRAFE_LEFT,
      KeyCodes.STRAFE_RIGHT,
      KeyCodes.TURN_LEFT,
      KeyCodes.TURN_RIGHT,
      KeyCodes.MOUSE_TURN_LEFT,
      KeyCodes.MOUSE_TURN_RIGHT,
      
    );
    const expectedPositons = new Array<Vec2D>(
      new Vec2D(4, 1),
      new Vec2D(1, 1),
      new Vec2D(1, -2),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
    )

    const seconds = 3;
    let map = new Map2D(32);
    map.parseMapData('spec/maps/city_yard.txt', readFromFile)
    for (let index = 0; index < inputs.length; index++) {
      controls.states.set(inputs[index], true);
      player.update(controls, map, seconds, dummyCallback);
      expect(player.getPosition.x).toBeCloseTo(expectedPositons[index].x);
      expect(player.getPosition.y).toBeCloseTo(expectedPositons[index].y);
      controls.clearInputs();
    }
  })

  it('should rotate the player by 90 degrees', () => {
    let player = new Player(0, 0, 0, HUDmock);
    player.rotate(Math.PI / 2); // (0 + Math.PI/2 + Math.PI*2) % (Math.PI*2)
    expect(player.getDirection).toBe(Math.PI / 2);
  });

  it('should rotate the player to the left and walks forward for 3 seconds, then rotates player to the right and walks forward for 3 seconds', () => {
    let player = new Player(0, 0, 0, HUDmock);
    let map = new Map2D(32);
    let controls = new Controls(navigator);
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
    expect(player.getPosition.x).toBeCloseTo(-seconds * Player.DEFAULT_WALK_SPEED * 2);
    expect(player.getPosition.y).toBeCloseTo(0);
  });
});