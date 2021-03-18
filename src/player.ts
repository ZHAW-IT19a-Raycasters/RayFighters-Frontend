import { Map } from "./map";
import { KeyCodes } from "./keycodes";
import { Controls } from "./controls";

/**
 * Player class, handling all the Player actions.
 */
class Player {
  private playerId: string;
  private position_x: number;
  private position_y: number;
  private direction: number;
  private currWeapon: any;
  private paces: any;

  public getPosition(): [number, number] {
    return [this.position_x, this.position_y];
  }

  public getDirection(): number {
    return this.direction;
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
    // TODO: this.weapon = default;
    this.paces = 0;
  }

  /*
  TODO: BitMAP
    function Bitmap(src, width, height) {
      this.image = new Image();
      this.image.src = src;
      this.width = width;
      this.height = height;
    }
*/

  /***
   * Rotates Player: Simulates head turning.
   *
   * @param angle angle by how much the player rotates
   */
  public rotate(angle: number): void {
    const CIRCLE = Math.PI * 2;
    this.direction = (this.direction + angle + CIRCLE) % CIRCLE;
  }

  /***
   * The Player walks distance on WorldMap
   *
   * @param distance how far the player walks
   * @param map {@link Map}
   * @param direction which direction to walk
   */
  public walk(distance: number, map: Map, direction: number): void {
    const dx = Math.cos(direction) * distance;
    const dy = Math.sin(direction) * distance;
    if (map.get(this.position_x + dx, this.position_y) <= 0)
      this.position_x += dx;
    if (map.get(this.position_x, this.position_y + dy) <= 0)
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
  public update(controls: Controls, map: Map, seconds: number): void {
    if (controls.states.get(KeyCodes.TURN_LEFT)) this.rotate(-Math.PI * seconds);
    if (controls.states.get(KeyCodes.TURN_RIGHT)) this.rotate(Math.PI * seconds);
    if (controls.states.get(KeyCodes.FORWARD)) this.walk(3 * seconds, map, this.direction);
    if (controls.states.get(KeyCodes.BACKWARD)) this.walk(-3 * seconds, map, this.direction);
    if (controls.states.get(KeyCodes.STRAFE_LEFT)) this.walk(3 * seconds, map, this.direction - Math.PI/2);
    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) this.walk(-3 * seconds, map, this.direction - Math.PI/2);
  }
}

export { Player };
