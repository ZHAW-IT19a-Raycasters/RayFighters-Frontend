import { Map2D, MapElementType } from "../maps/map2d";
import { KeyCodes, Controls } from "./controls";
import { Vec2D } from "../common/vec2d";
import { MathHelper } from "../common/mathhelper";
import { Weapon, WeaponState } from "./weapon";
import { Command } from "../communication/command";
import { PlayerInfo } from "../communication/playerinfo";
import { Sound, SoundType } from "../sound/sound";
import { Enemy } from "../entities/enemy";


/**
 * Player class, handling all the Player actions.
 */
export class Player {
  public static readonly DEFAULT_WALK_SPEED = 2;
  public static readonly MAX_HEALTH = 150;
  private static readonly DEATH_SOUND_VOLUME = 0.5;

  private playerInfo: PlayerInfo;
  private health: number;
  private position: Vec2D;
  private paces: number;
  private lastPaces: number;
  private dead: boolean;

  /**
   * Timer for walking sounds.
   */
  private walkTimer: number;

  

  /***
   * @constructor
   * @param x Player postition on the x-axis
   * @param y Player postition on the y-axis
   * @param angle Starting angle/direction
   */
  constructor(x: number, y: number, private angle: number, private weapon?: Weapon, private walkSpeed?: number) {
    this.position = new Vec2D(x, y);
    this.paces = 0;
    if (!walkSpeed) {
      this.walkSpeed = Player.DEFAULT_WALK_SPEED;
    }
    this.playerInfo = new PlayerInfo({ killCount: 0, deathCount: 0 })
    this.walkTimer = 0;
  }

  public setWalkSpeed(speed: number): void {
    this.walkSpeed = speed;
  }

  public setWeapon(weapon: Weapon): void {
    this.weapon = weapon;
  }

  /***
   * Rotates Player: Simulates head turning.
   *
   * @param angle angle by how much the player rotates
   */
  public rotate(angle: number): void {
    this.angle = (this.angle + angle + MathHelper.CIRCLE) % MathHelper.CIRCLE;
  }

  /***
   * The Player walks distance on WorldMap
   *
   * @param distance how far the player walks
   * @param map {@link Map}
   * @param direction which direction to walk
   */
  public walk(distance: number, map: Map2D, direction: number): void {
    const dx = Math.cos(direction) * distance;
    const dy = Math.sin(direction) * distance;
    if (map.getElementByPosition(new Vec2D(this.position.x + dx, this.position.y)).getType() !== MapElementType.WALL) {
      this.position.x += dx;
    }
    if (map.getElementByPosition(new Vec2D(this.position.x, this.position.y + dy)).getType() !== MapElementType.WALL) {
      this.position.y += dy;
    }
  }

  /***
   * Handles all the movement actions of the Player and communicates to the server.
   *
   * @param controls  {@link Controls}
   * @param map {@link Map}
   * @param seconds
   */
  public update(controls: Controls, map: Map2D, seconds: number, sendCallback: any): void {
    this.lastPaces = this.paces;
    let hasWalkedX = 0;
    let hasWalkedY = 0;
    let hasRotated = 0;
    const walkDelta = this.walkSpeed * seconds;

    if (this.dead) {
      // If the player has died, we should not be able to shoot or move anymore.
      return;
    }

    if (controls.states.get(KeyCodes.TURN_LEFT)) {
      ++hasRotated;
      this.rotate(-Math.PI * seconds);
    }

    if (controls.states.get(KeyCodes.TURN_RIGHT)) {
      ++hasRotated;
      this.rotate(Math.PI * seconds);
    }

    if (controls.states.get(KeyCodes.MOUSE_TURN_LEFT)) {
      ++hasRotated;
      this.rotate(-Math.PI * (seconds * 0.75));
      controls.states.set(KeyCodes.MOUSE_TURN_LEFT, false)
    }

    if (controls.states.get(KeyCodes.MOUSE_TURN_RIGHT)) {
      ++hasRotated;
      this.rotate(Math.PI * (seconds * 0.75));
      controls.states.set(KeyCodes.MOUSE_TURN_RIGHT, false)
    }

    if (controls.states.get(KeyCodes.FORWARD)) {
      this.walk(walkDelta, map, this.angle);
      ++hasWalkedY;
    }

    if (controls.states.get(KeyCodes.BACKWARD)) {
      this.walk(-walkDelta, map, this.angle);
      ++hasWalkedY;
    }

    if (controls.states.get(KeyCodes.STRAFE_LEFT)) {
      this.walk(walkDelta, map, this.angle - Math.PI / 2);
      ++hasWalkedX;
    }

    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) {
      this.walk(-walkDelta, map, this.angle - Math.PI / 2);
      ++hasWalkedX;
    }

    // Player-side movement handling and communication to server. Checks if the player has moved or rotated
    if (hasWalkedX == 1 || hasWalkedY == 1 || hasRotated >= 1) {
      // If so, accumulate paces and send message to server
      this.paces += walkDelta;

      this.walkTimer += seconds;
      if (this.walkTimer > Enemy.WALK_INTERVAL * Enemy.STEP_SOUND_DIVIDER) {
        this.walkTimer = 0;
        Sound.get.play(SoundType.STEP, Sound.STEP_MAX_VOLUME);
      }
      sendCallback(Command.move(this.position.x, this.position.y, this.angle));
    }

    // Player-side weapon handling and communication to server.
    if (this.weapon) {
      if (controls.states.get(KeyCodes.SHOOT) && (this.weapon.getWeaponState === WeaponState.IDLE)) {
        this.weapon.shoot();

        // Send shoot message to server
        sendCallback(Command.shoot(this.angle));

        // If the weapon is semiautomatic, the player isn't able to hold down the button to shoot continuously.
        if (this.weapon.isSemiautomatic) {
          // Toggle the controls map shoot entry back to false.
          controls.states.set(KeyCodes.SHOOT, false);
        }
      }

      this.weapon.update(seconds);

      //document.getElementById('debug-window').innerText = "Position: (" + this.position.x + " | " + this.position.y + ")";
    }

    if (controls.states.get(KeyCodes.SCOREBOARD)) {
      // TODO Show scoreboard on HUD
    }
  }

  private die(){
    if(this.dead){
      Sound.get.play(SoundType.DEATH, Player.DEATH_SOUND_VOLUME);
    }
  }

  /**
   * Check if player has moved in last tick. Used to prevent weapon bob.
   * @returns True if player has moved.
   */
  public hasMoved(): boolean {
    return this.lastPaces !== this.paces;
  }

  /**
   * Change health based on given delta. Calls death handling if health falls below zero.
   * @param delta positive or negative health deviation.
   */
  public changeHealth(delta: number) {
    if (this.health + delta < 0) {
      this.dead = true;
      return; 
    } else if (this.health + delta >= Player.MAX_HEALTH) {
      this.health = Player.MAX_HEALTH;
    } else {
      this.health += delta;
    }
  }

  public set setDirection(d: number) {
    this.angle = d;
  }

  public set setPosition(p: Vec2D) {
    this.position = p;
  }

  public get getPlayerInfo() {
    return this.playerInfo;
  }

  public setDead(dead: boolean) {
    this.dead = dead;
    this.die();
  }

  public get isDead(){
    return this.dead;
  }

  public get getPosition(): Vec2D {
    return this.position;
  }

  public get getDirection(): number {
    return this.angle;
  }

  public get getWeapon(): Weapon {
    return this.weapon;
  }

  public get getPaces(): number {
    return this.paces;
  }

  public get getWalkSpeed(): number {
    return this.walkSpeed;
  }
}
