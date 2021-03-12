class Renderer {
  /**
    * Canvas DOM element to draw in
    */
  canvas: any; 
  ctx: any;

  /**
    * @constructor
    * @param {DOM} canv - Canvas element to draw game in
    * @param {number} res - Resolution to render the game in (pixels). Canvas sizes may differ.
    * @param {number} focal - focal length of our viewport, the field of view.
    */
  constructor(canv: any, res: number, focal: number) {
    this.canvas = canv;
    this.ctx = canv.getContext('2d');
    
  }

  render(): void {
    this.ctx.save();
    this.ctx.fillRect(20, 20, 300, 100);
    // TODO: Render the entirety of the game here
    this.ctx.restore();
  }
}

export { Renderer };
