import { Map2D, MapElementType } from "./map2d";
import { KeyCodes } from "./controls";
import { Controls } from "./controls";
import { Vec2D } from "./vec2d";
import { Image2D, Renderer } from "./renderer";
import { MathHelper } from "./mathhelper";

/**
 * Player class, handling all the Player actions.
 */
export class Player {
  private playerId: string;
  private position: Vec2D;
  private direction: number;
  private currWeapon: Image2D;
  private paces: any;

  public get getPosition(): Vec2D {
    return this.position;
  }

  public get getDirection(): number {
    return this.direction;
  }

  public get getcurrWeapon(): Image2D {
    return this.currWeapon;
  }

  /***
   * @constructor
   * @param x Player postition on the x-axis
   * @param y Player postition on the y-axis
   * @param direction Starting angle/direction
   */
  constructor(x: number, y: number, direction: number) {
    this.position = new Vec2D(x, y);
    this.direction = direction;
    //this.setWeapon(new Image2D('./assets/weapons/knife_hand.png', 319, 320));
    this.paces = 0;
  }
  /***
   * Sets the Image of the weapon the Player is yielding
   *
   * @param src path to the image
   * @param width width of the image
   * @param height height of the image
   */
  public setWeapon(src: string, width: number, height: number): void {
    this.currWeapon = new Image2D(src, width, height);
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
    this.paces += distance;
  }

  /***
   * Handles all the movement actions of the Player
   *
   * @param controls  {@link Controls}
   * @param map {@link Map}
   * @param seconds
   */
  public update(controls: Controls, map: Map2D, seconds: number): void {
    if (controls.states.get(KeyCodes.TURN_LEFT)) this.rotate(-Math.PI * seconds);
    if (controls.states.get(KeyCodes.TURN_RIGHT)) this.rotate(Math.PI * seconds);
    if (controls.states.get(KeyCodes.MOUSE_TURN_LEFT)) {
      this.rotate(-Math.PI * (seconds * 0.75));
      controls.states.set(KeyCodes.MOUSE_TURN_LEFT, false)
    }
    if (controls.states.get(KeyCodes.MOUSE_TURN_RIGHT)) {
      this.rotate(Math.PI *  (seconds * 0.75));
      controls.states.set(KeyCodes.MOUSE_TURN_RIGHT, false)
    }
    if (controls.states.get(KeyCodes.FORWARD)) this.walk(3 * seconds, map, this.direction);
    if (controls.states.get(KeyCodes.BACKWARD)) this.walk(-3 * seconds, map, this.direction);
    if (controls.states.get(KeyCodes.STRAFE_LEFT)) this.walk(3 * seconds, map, this.direction - Math.PI / 2);
    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) this.walk(-3 * seconds, map, this.direction - Math.PI / 2);
  }
}
