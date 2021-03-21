import { Player } from './player';
import { Room } from './room';

class Renderer {
  /**
    * Canvas DOM element to draw in
    */
  canvas: any;
  ctx: any;
  static CIRCLE = Math.PI * 2

  /**
    * @constructor
    * @param {DOM} canv - Canvas element to draw game in
    * @param {number} res - Resolution to render the game in (pixels). Canvas sizes may differ.
    * @param {number} focal - focal length of our viewport, the field of view.
    */
  constructor(canv: any, res: number, focal: number) {
    this.canvas = canv;
    this.ctx = canv.getContext('2d');
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  render(room: Room, player: Player): void {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawSkyBox(room.getSkyBox, player.getDirection())
    // TODO: Render the entirety of the game here
    this.ctx.restore();
  }

  /**
   * Drawing the skybox which encompasses both sky and floor.
   * @param direction Viewing angle in radients. (Totally rad)
   */
  public drawSkyBox(skybox: Image2D, direction: number): void {
    var width = skybox.width * (this.canvas.height / skybox.height) * 2;
    var left = (direction / Renderer.CIRCLE) * -width;  

    this.ctx.save();
    this.ctx.drawImage(skybox.image, left, 0, width, this.canvas.height);

    // Check for background scroll repeat
    if (left < width -  window.innerWidth * 0.5) { 
      console.log("left : " + left + " width: " + width + " window.innerWidth: " + window.innerWidth)
      this.ctx.drawImage(skybox.image, left + width, 0, width, this.canvas.height);
    }

    this.ctx.restore();
  }

  /**
   * Image move method, just used for controls demo.
   * @param x coordinate
   * @param y coordinate
   */
  public move(x: number, y: number) {
    //this.ctx.drawImage(this.image, 100 + x, 100 + y, 500, 500);
  }
}

/**
 * 2D image object class for easier graphics handling.
 */
class Image2D {
  image: any;
  source: string;

  constructor(source: string, public width: number, public height: number) {
    this.image = new Image(width, height);
    this.image.src = source;
  }
}

export { Renderer };
export { Image2D };