import { Room } from './room';

class Renderer {
  /**
    * Canvas DOM element to draw in
    */
  canvas: any; 
  ctx: any;
  room: Room;
  image: any;

  /**
    * @constructor
    * @param {DOM} canv - Canvas element to draw game in
    * @param {number} res - Resolution to render the game in (pixels). Canvas sizes may differ.
    * @param {number} focal - focal length of our viewport, the field of view.
    */
  constructor(canv: any, res: number, focal: number) {
    this.canvas = canv;
    this.ctx = canv.getContext('2d');
    this.room = new Room(123);
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.image = new Image(1000, 1000); // Using optional size for image
    this.image.src = 'https://static.wikia.nocookie.net/virgin-vs-chad/images/7/79/Chad.png';
  }

  render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    // TODO: Render the entirety of the game here
    this.ctx.restore();
  }

  /**
   * Image move method, just used for controls demo.
   * @param x coordinate
   * @param y coordinate
   */
  public move(x: number, y: number){
    this.ctx.drawImage(this.image, 100 + x, 100 + y, 500, 500);
  }
}

export { Renderer };
