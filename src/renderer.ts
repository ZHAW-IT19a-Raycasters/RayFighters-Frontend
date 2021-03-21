import { MapElement, MapElementType } from './map2d';
import { Player } from './player';
import { Raycaster, Step } from './raycaster';
import { Room } from './room';
import { Vec2D } from './vec2d';

class Renderer {
  static CIRCLE = Math.PI * 2
  static STANDARD_DRAWDISTANCE = 16;
  static STANDARD_FOCAL = 0.75

  /**
    * Canvas DOM element to draw in
    */
  private canvas: any;
  private context: any;

  /**
   * Rendering resolution. Determines how many rays are cast. 
   * A lower number means lower work load for the CPU.
   */
  private resolution: number; // TODO create dynamic resolution based of FPS (super based idea)

  /**
   * Bar spacing. Determines how broad the bars are distributed from each other.
   */
  private spacing: number;

  /**
   * Determines how far away the walls are rendered.
   * 1 means a maximum of 1 block gets rendered in the distance.
   * A lower number means lower work load for the CPU.
   */
  private drawDistance: number;

  /**
   * Field of view. Ranges from 0 to 1.
   */
  private focalLength: number;


  /**
    * @constructor
    * @param {DOM} canv - Canvas element to draw game in
    * @param {number} res - Resolution to render the game in (pixels). Canvas sizes may differ.
    * @param {number} focal - focal length of our viewport, the field of view.
    */
  constructor(canvas: any, resolution: number, drawDistance?: number, focal?: number) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.resolution = resolution;
    this.spacing = canvas.width / resolution;
    this.drawDistance = drawDistance || Renderer.STANDARD_DRAWDISTANCE;
    this.focalLength = focal || Renderer.STANDARD_FOCAL;


    let gradient = this.context.createLinearGradient(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height);
    gradient.addColorStop(1, '#666666');
    gradient.addColorStop(0, '#000000');
    this.context.fillStyle = gradient;
  }

  render(room: Room, player: Player): void {
    this.context.save();
    //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawSkyBox(room.getSkyBox, player.getDirection())
    this.context.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2)
    this.drawWalls(room, player)
    // TODO: Render the entirety of the game here
    this.context.restore();
  }

  /**
   * Draw a wall.
   * @param room 
   * @param player 
   */
  private drawWalls(room: Room, player: Player): void {
    this.context.save();

    // Cast ray for each bar, depending on resolution
    for (let bar = 0; bar < this.resolution; bar++) {
      let xAxisPosition = bar / this.resolution - 0.5;
      let rayAngle = Math.atan2(xAxisPosition, this.focalLength);
      let steps = room.getMap.rayCast(player.getPosition(), player.getDirection() + rayAngle, this.drawDistance)
      this.drawBar(room, bar, steps, rayAngle)
    }

    this.context.restore();
  }

  /**
   * Draw a single bar.
   * @param room 
   * @param bar 
   * @param steps 
   * @param rayAngle 
   */
  private drawBar(room: Room, bar: number, steps: Step[], rayAngle: number): void {
    let texture = room.getWallImages[0];
    let hit = -1;
    let left = Math.floor(bar * this.spacing);
    let width = Math.ceil(this.spacing);

    while (++hit < steps.length && steps[hit].mapElement.getType() <= MapElementType.FLOOR);

    for (let s = steps.length - 1; s >= 0; s--) {
      let step = steps[s];

      if (s === hit) {
        let textureX = Math.floor(texture.width * step.offset);
        let wall = this.calculateWall(step.mapElement.getType(), rayAngle, step.distance);
        //this.context.globalAlpha = 1;
        this.context.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
      }
    }
  }

  /**
   * Calculate bottom, top and height of wall.
   * @param height Height of current bar.
   * @param angle Angle of current bar.
   * @param distance Distance to the bar.
   * @returns 
   */
  private calculateWall(height: number, angle: number, distance: number) {
    // Calculate fisheye correction.
    let fishEyeCorrection = distance * Math.cos(angle);

    // Calculate wall height.
    let wallHeight = this.canvas.height * height / fishEyeCorrection;

    // Calculate where the wall begins on the y axis.
    let wallFloor = this.canvas.height / 2 * (1 + 1 / fishEyeCorrection);

    return {
      top: wallFloor - wallHeight,
      height: wallHeight
    }
  }

  /**
   * Drawing the skybox which encompasses both sky and floor.
   * @param direction Viewing angle in radients. (Totally rad)
   */
  private drawSkyBox(skybox: Image2D, direction: number): void {
    var width = skybox.width * (this.canvas.height / skybox.height) * 2;
    var left = (direction / Renderer.CIRCLE) * -width;

    this.context.save();
    this.context.drawImage(skybox.image, left, 0, width, this.canvas.height);

    // Check for background scroll repeat
    if (left < width - window.innerWidth * 0.5) {
      this.context.drawImage(skybox.image, left + width, 0, width, this.canvas.height);
    }

    this.context.restore();
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