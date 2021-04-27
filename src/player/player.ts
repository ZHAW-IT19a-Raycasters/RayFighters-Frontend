import { Map2D, MapElementType } from "../maps/map2d";
import { KeyCodes, Controls } from "./controls";
import { Vec2D } from "../common/vec2d";
import { MathHelper } from "../common/mathhelper";
import { Weapon } from "./weapon";


/**
 * Player class, handling all the Player actions.
 */
export class Player {
  public static readonly DEFAULT_WALK_SPEED = 2;
  private playerId: string;
  private position: Vec2D;
  private paces: number;
  private lastPaces: number;

  public get getPosition(): Vec2D {
    return this.position;
  }

  public get getDirection(): number {
    return this.direction;
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

  /***
   * @constructor
   * @param x Player postition on the x-axis
   * @param y Player postition on the y-axis
   * @param direction Starting angle/direction
   */
  constructor(x: number, y: number, private direction: number, private weapon?: Weapon, private walkSpeed?: number) {
    this.position = new Vec2D(x, y);
    this.paces = 0;
    if(!walkSpeed) {
      this.walkSpeed = Player.DEFAULT_WALK_SPEED;
    }
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
    this.direction = (this.direction + angle + MathHelper.CIRCLE) % MathHelper.CIRCLE;
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
   * Handles all the movement actions of the Player
   *
   * @param controls  {@link Controls}
   * @param map {@link Map}
   * @param seconds
   */
  public update(controls: Controls, map: Map2D, seconds: number): void {
    this.lastPaces = this.paces;

    let hasWalkedX = 0, hasWalkedY = 0;
    const walkDelta = this.walkSpeed * seconds;
    if (controls.states.get(KeyCodes.TURN_LEFT)) {
      this.rotate(-Math.PI * seconds);
    }
    if (controls.states.get(KeyCodes.TURN_RIGHT)) {
      this.rotate(Math.PI * seconds);
    }
    if (controls.states.get(KeyCodes.MOUSE_TURN_LEFT)) {
      this.rotate(-Math.PI * (seconds * 0.75));
      controls.states.set(KeyCodes.MOUSE_TURN_LEFT, false)
    }
    if (controls.states.get(KeyCodes.MOUSE_TURN_RIGHT)) {
      this.rotate(Math.PI *  (seconds * 0.75));
      controls.states.set(KeyCodes.MOUSE_TURN_RIGHT, false)
    }

    if (controls.states.get(KeyCodes.FORWARD)) {
      this.walk(walkDelta, map, this.direction);
      ++hasWalkedY;
    }
    if (controls.states.get(KeyCodes.BACKWARD)) {
      this.walk(-walkDelta, map, this.direction);
      ++hasWalkedY;
    }
    if (controls.states.get(KeyCodes.STRAFE_LEFT)) {
      this.walk(walkDelta, map, this.direction - Math.PI / 2);
      ++hasWalkedX;
    }
    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) {
      this.walk(-walkDelta, map, this.direction - Math.PI / 2);
      ++hasWalkedX;
    }
    if(hasWalkedX == 1 || hasWalkedY == 1) {
      this.paces += walkDelta;
    }

    if(this.weapon) {
      if (controls.states.get(KeyCodes.SHOOT)) {
        this.weapon.shoot();
      }

      this.weapon.update(seconds);
    }
  }

  /**
   * Check if player has moved in last tick. Used to prevent weapon bob.
   * @returns True if player has moved.
   */
  public hasMoved(): boolean {
    return this.lastPaces !== this.paces;
  }

  
  public set setDirection(d : number) {
    this.direction = d;
  }

  public set setPosition(p: Vec2D) {
    this.position = p;
  }
}
