import { Controls, KeyCodes } from "../src/player/controls";
import { Map2D } from "../src/maps/map2d";
import { Player } from "../src/player/player";
import { Packet } from "../src/communication/packet";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import { Weapon, WeaponState } from "../src/player/weapon";
import { Vec2D } from "../src/common/vec2d";
import { GameHUD } from "./gamehudmock";

// Setup JSDOM
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, navigator } = (new JSDOM(index)).window;
global.document = document;

// Constants
const HUDmock = new GameHUD();
const testPosition = new Vec2D(6, 9);
const testAngle = 6.9;
const testSpeed = 1;
const testWeapon = new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4);
const dummyCallback = function (p: Packet) { /* no implementation needed */ };

// Control setup
const movementInputs = new Array<KeyCodes>(
  KeyCodes.FORWARD,
  KeyCodes.BACKWARD,
  KeyCodes.STRAFE_LEFT,
  KeyCodes.STRAFE_RIGHT,
  KeyCodes.TURN_LEFT,
  KeyCodes.TURN_RIGHT,
  KeyCodes.MOUSE_TURN_LEFT,
  KeyCodes.MOUSE_TURN_RIGHT      
);
const guiInputs = new Array<KeyCodes>(
  KeyCodes.FPS,
  KeyCodes.SCOREBOARD,
  KeyCodes.SETTINGS   
);


function setupPlayer(position: Vec2D, angle: number) {
  return new Player(position.x, position.y, angle, HUDmock, testWeapon, 1);
}

var readFromFile = (filename: string) => {
  return fs.readFileSync(filename, 'utf8');
}

describe('Player module testing', () => {
  it('should instantiate the player correctly', () => {
    // Setup
    const testPlayer = setupPlayer(testPosition, testAngle);
    testPlayer.setScreenWidth(1024);

    // Verification
    expect(testPlayer.getPosition.x).toBe(testPosition.x);
    expect(testPlayer.getPosition.y).toBe(testPosition.y);
    expect(testPlayer.getDirection).toBe(testAngle);
    expect(testPlayer.getWalkSpeed).toBe(testSpeed);
    expect(testPlayer.getWeapon).toEqual(testWeapon);
    expect(testPlayer.isDead).toBe(false);
    expect(testPlayer.getPlayerInfo).toBeUndefined;
  });

  it('should react to controls correctly', () => {
    // Setup
    const testPlayer = setupPlayer(new Vec2D(1, 1), 0);
    let controls = new Controls(navigator);
    const seconds = 3;
    let map = new Map2D(32);
    map.parseMapData('spec/maps/city_yard.txt', readFromFile);

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

    // Test & Verification
    for (let i = 0; i < movementInputs.length; i++) {
      controls.states.set(movementInputs[i], true);
      testPlayer.update(controls, map, seconds, dummyCallback);
      expect(testPlayer.getPosition.x).toBeCloseTo(expectedPositons[i].x);
      expect(testPlayer.getPosition.y).toBeCloseTo(expectedPositons[i].y);
      expect(testPlayer.hasMoved()).toBe(true);
      controls.clearInputs();
    }

    for (let i = 0; i < guiInputs.length; i++) {
      controls.states.set(guiInputs[i], true);
      testPlayer.update(controls, map, seconds, dummyCallback);
      expect(controls.states.get(guiInputs[i])).toBe(true);
      controls.clearInputs();
    }
  })

  it('should rotate the player by 90 degrees', () => {
    let player = new Player(0, 0, 0, HUDmock);
    player.rotate(Math.PI / 2);
    expect(player.getDirection).toBe(Math.PI / 2);
  });

  it('should rotate the player to the left and walks forward for 3 seconds, then rotates player to the right and walks forward for 3 seconds', () => {
    // Setup
    let player = new Player(0, 0, 0, HUDmock);
    let map = new Map2D(32);
    let controls = new Controls(navigator);
    controls.states.set(KeyCodes.FORWARD, true);
    controls.states.set(KeyCodes.TURN_LEFT, true);
    const seconds = 3;

    // Test
    player.update(controls, map, seconds, dummyCallback);

    // Verification
    expect(player.getDirection).toBeCloseTo(-Math.PI);
    expect(player.getPosition.x).toBeCloseTo(-seconds * Player.DEFAULT_WALK_SPEED);
    expect(player.getPosition.y).toBeCloseTo(0);
    expect(player.getPaces).toBe(seconds * 2);
    expect(player.hasMoved()).toBe(true);

    // Test
    controls.states.set(KeyCodes.TURN_RIGHT, true);
    player.update(controls, map, seconds, dummyCallback);

    // Verification
    expect(player.getDirection).toBeCloseTo(Math.PI);
    expect(player.getPosition.x).toBeCloseTo(-seconds * Player.DEFAULT_WALK_SPEED * 2);
    expect(player.getPosition.y).toBeCloseTo(0);
    expect(player.getPaces).toBe(seconds * 4);
    expect(player.hasMoved()).toBe(true);
  });

  it('should make the player shoot correctly', () => {
    // Setup
    const player = setupPlayer(testPosition, testAngle);
    let map = new Map2D(32);
    let controls = new Controls(navigator);
    controls.states.set(KeyCodes.SHOOT, true);
    const seconds = 0.5;

    // Test
    player.update(controls, map, seconds, dummyCallback);

    // Verification
    expect(testWeapon.getWeaponState).toBe(WeaponState.SHOOTING);
  })

  it('should handle player death correctly and should prevent it from moving after dying', () => {
    // Setup
    const testPlayer = setupPlayer(new Vec2D(1, 1), 0);
    let controls = new Controls(navigator);
    const seconds = 3;
    let map = new Map2D(32);
    map.parseMapData('spec/maps/city_yard.txt', readFromFile);

    const expectedPositons = new Array<Vec2D>(
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
      new Vec2D(1, 1),
    );

    // Test
    testPlayer.setDead(true);

    // Verification
    for (let i = 0; i < movementInputs.length; i++) {
      controls.states.set(movementInputs[i], true);
      testPlayer.update(controls, map, seconds, dummyCallback);
      expect(testPlayer.getPosition.x).toBeCloseTo(expectedPositons[i].x);
      expect(testPlayer.getPosition.y).toBeCloseTo(expectedPositons[i].y);
      expect(testPlayer.hasMoved()).toBe(false);
      controls.clearInputs();
    }
  });

});