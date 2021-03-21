import { Map2D } from "./map2d";
import { KeyCodes } from "./controls";
import { Controls } from "./controls";
import { Vec2D } from "./vec2d";
import { Renderer } from "./renderer";

/**
 * Player class, handling all the Player actions.
 */
class Player {
  private playerId: string;
  private position_x: number;
  private position_y: number;
  private direction: number;
  private currWeapon: HTMLImageElement;
  private paces: any;

  public getPosition(): Vec2D {
    return new Vec2D(this.position_x, this.position_y); // TODO Changed this, sowwy
  }

  public getDirection(): number {
    return this.direction;
  }

  public getcurrWeapon(): HTMLImageElement {
    return this.currWeapon;
  }

  /***
   * @constructor
   * @param x Player postition on the x-axis
   * @param y Player postition on the y-axis
   * @param direction Starting angle/direction
   */
  constructor(x: number, y: number, direction: number) {
    this.position_x = x;
    this.position_y = y;
    this.direction = direction;
    //this.setWeapon('assets/plug_hand.png', 319, 320);
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
    this.currWeapon = new Image(width, height);
    this.currWeapon.src = src;
  }

  /***
   * Rotates Player: Simulates head turning.
   *
   * @param angle angle by how much the player rotates
   */
  public rotate(angle: number): void {
    this.direction = (this.direction + angle + Renderer.CIRCLE) % Renderer.CIRCLE;
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
    if (map.getElem(new Vec2D(this.position_x + dx, this.position_y)).getType() <= 0) // TODO Changed this, sowwy
      this.position_x += dx;
    if (map.getElem(new Vec2D(this.position_x, this.position_y + dy)).getType() <= 0) // TODO Changed this, sowwy
      this.position_y += dy;
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
    if (controls.states.get(KeyCodes.FORWARD)) this.walk(3 * seconds, map, this.direction);
    if (controls.states.get(KeyCodes.BACKWARD)) this.walk(-3 * seconds, map, this.direction);
    if (controls.states.get(KeyCodes.STRAFE_LEFT)) this.walk(3 * seconds, map, this.direction - Math.PI / 2);
    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) this.walk(-3 * seconds, map, this.direction - Math.PI / 2);
  }
}

export { Player };
