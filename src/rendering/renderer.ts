import { MapElementType } from '../maps/map2d';
import { MathHelper } from '../common/mathhelper';
import { Player } from '../player/player';
import { Step } from './raycaster';
import { Room } from '../maps/room';
import { Vec2D } from '../common/vec2d';
import { Weapon } from '../player/weapon';
import { Enemy } from '../entities/enemy';

/**
 * Data class: 2D image object for easier graphics handling.
 */
export class Image2D {
  image: any;
  source: string;

  constructor(source: string, public width: number, public height: number) {
    if (typeof process === 'undefined') {
      this.image = new Image(width, height);
      this.image.src = source;
    } else {
      // Workaround for undefined Image object errors when running in node (Jasmine testing)
      this.image = { src: source };
    }
    this.source = source;
  }
}

/**
 * Data class used to store color gradients. In our case, floors and ceilings.
 * Near refers to the color closer to the player. Far the color far away in the
 * horizon.
 */
export class ColorGradient {
  constructor(public near: string, public far: string) { }
}

export class Renderer {
  /**
   * Color of the death screen (if the {@link Player} dies)
   */
  private static readonly DEATH_SCREEN_COLOR = '#a714a2';

  /**
   * Maximum opacity of the death screen (if the {@link Player} dies)
   */
  private static readonly DEATH_SCREEN_MAX_OPACITY = 0.5;

  /**
   * Color of the crosshair.
   */
  private static readonly CROSSHAIR_COLOR = '#a714a2';

  /**
   * Default value for this.drawDistance
   */
  private static readonly STANDARD_DRAWDISTANCE = 16;

  /**
   * Default value for this.focalLength
   */
  private static readonly STANDARD_FOCAL = 0.75;

  /**
   * Used for calculating this.fieldOfView
   */
  private static readonly SENSORWIDTH = 1;

  /**
   * Default font for player tags.
   */
  private static readonly FONT_NAME = 'ArcadeClassic';

  /**
   * Default font size for player tags.
   */
  private static readonly FONT_BASE_SIZE = 64;

  /**
   * Default font color for player tag
   */
  private static readonly FONT_COLOR = '#FFFFFF';

  /**
    * Canvas DOM element to draw in
    */
  private canvas: any;
  /**
   * Javascript Graphics Context 2D
   */
  private context: any;

  /**
   * Rendering resolution. Determines how many rays are cast. 
   * A lower number means lower work load for the CPU.
   * The bigger this is, the more detailed the walls are since they have more
   * bars to represent them.
   */
  private resolution: number;

  /**
   * Bar spacing. Determines how wide the bars are are.
   * Example: If our resolution is 500 and our canvas is 1000,
   * then spacing is 2, so walls are made of vertical bars 2px wide each.
   * Note that the higher this (and thus resolution), the more rays are being
   * cast.
   */
  private spacing: number;

  /**
   * Determines how far away the walls are rendered.
   * 1 means a maximum of 1 block gets rendered in the distance.
   * A lower number means lower work load for the CPU.
   * 1 unit = 1 MapElement
   */
  private drawDistance: number;

  /**
   * Determines the field of view. Ranges from 0 to 1.
   * This refers to the y-vector length in the unit circle. The shorter it is,the more you see.
   * https://en.wikipedia.org/wiki/Focal_length
   */
  private focalLength: number;

  /**
   * Field of view of the player.
   * Note that this is in radians and set depending on sensor width and the
   * focal length.
   */
  private fieldOfView: number;

  /**
   * Shall equal 0.5 * this.fieldOfView. Why as variable?: Because it's used
   * frequently and we want to save ourselves the divisions.
   */
  private halfFieldOfView: number;

  /**
   * The color gradient to be shown below (floor)
   */
  private floorGradient: ColorGradient;

  /**
   * The color gradient to be shown above (ceiling)
   */
  private ceilingGradient: ColorGradient;

  /**
   * The near color (#RRGGBB) for resetting the ceiling
   */
  private originalCeilingNearColor: string;

  /**
   * The near color (#RRGGBB) for resetting the floor
   */
  private originalFloorNearColor: string;

  /**
    * Buffer to record at what distances the individual bars were drawn from the player.
    * This is crucial to determine whether we are allowed to draw a Sprite or Enemy.
    * Is used as a lookup table. Mapping is [x_coor] -> distance_from_player
    */
  private barDepthBuffer: Array<number>;

  private screenRatio: number;

  /**
    * @constructor
    * @param {DOM} canv - Canvas element to draw game in
    * @param {number} resolution - Resolution to render the game in (pixels). Canvas sizes may differ.
    * @param {number} drawDistance - How many units away do we stop drawing walls
    * @param {number} focalLen - focal length for our drawing calls
    * @param {ColorGradient} floorGradient - What color (gradient) the floor should be drawn in
    * @param {ColorGradient} ceilGradient - What color (gradient) the ceiling should be drawn in
    * @param {any} windowMock - Mocked window object, used exclusively for testing.
    */
  constructor(canvas: any, resolution: number, drawDistance?: number, focalLen?: number, floorGradient?: ColorGradient, ceilGradient?: ColorGradient, windowMock?: any) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    // Case differentiation for testing. Initializes with a mocked window object to make this and other classes testable.
    if(windowMock) {
      this.canvas.width = windowMock.innerWidth;
      this.canvas.height = windowMock.innerHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    this.resolution = resolution;
    this.spacing = canvas.width / resolution;
    this.drawDistance = drawDistance || Renderer.STANDARD_DRAWDISTANCE;
    this.focalLength = focalLen || Renderer.STANDARD_FOCAL;
    this.floorGradient = floorGradient;
    this.ceilingGradient = ceilGradient;

    this.fieldOfView = 2 * Math.atan(Renderer.SENSORWIDTH / (2 * this.focalLength)) // 2 * ARCTAN (SENSOR WIDTH / (2 X FOCAL LENGTH)) * (180/Π)
    this.halfFieldOfView = 0.5 * this.fieldOfView;
    this.screenRatio = this.canvas.width / this.fieldOfView;

    if (ceilGradient) {
      this.originalCeilingNearColor = ceilGradient.near;
    }
    if (floorGradient) {
      this.originalFloorNearColor = floorGradient.near;
    }

    this.barDepthBuffer = new Array<number>(this.canvas.width);
  }

  /**
   * Main render call to be called each gameloop tick
   * @param room Room to be drawn with it's skybox, etc
   * @param player 
   */
  public render(room: Room, player: Player, time: number): void {
    this.context.save();

    this.muzzleFlashGradientCheck(player.getWeapon);

    // First, if there IS a ceilingGradient, then we do NOT draw a skybox
    // because we wouldn't be able to see it anyways:
    if (this.ceilingGradient) {
      this.drawCeiling();
    } else {
      this.drawSkyBox(room.getMap.getSkyBox, player.getDirection)
    }

    if (this.floorGradient) {
      this.drawFloor();
    }

    this.drawWalls(room, player)

    this.drawSprites(room, player);

    // When the player is dead, we don't show his weapon
    if (player.getWeapon && !player.isDead) {
      this.drawWeapon(player, time);
      this.drawCrosshair();
    }

    // Show the death screen overlay when dead
    if (player.isDead) {
      this.deathScreen();
    }

    this.context.restore();
  }

  /**
   * See if the player shot his gun and overwrite the floor and ceiling gradient
   */
  private muzzleFlashGradientCheck(weapon: Weapon) {
    if (weapon.isMuzzleFlashOngoing) {
      if (this.ceilingGradient) {
        this.ceilingGradient.near = weapon.getMuzzleFlashColor;
      }
      if (this.floorGradient) {
        this.floorGradient.near = weapon.getMuzzleFlashColor;
      }
    } else {
      if (this.ceilingGradient) {
        this.ceilingGradient.near = this.originalCeilingNearColor;
      }
      if (this.floorGradient) {
        this.floorGradient.near = this.originalFloorNearColor;
      }
    }
  }

  /**
   * Draw the player's weapon with a bobbing animation.
   * 
   * @param player Pass the player to get his weapon
   * @param time Needed for time synchronization of the bobbing animation
   */
  private drawWeapon(player: Player, time: number) {
    const weapon = player.getWeapon;
    const bobSway = 20; //<-- How much the weapon sways from left ot right
    const bobSpeed = 3; //<-- How fast the weapon sways

    // Positioning. We want the weapon to be on the bottom, middle.
    const screenHeightFraction = this.canvas.height / weapon.getCurrentImage2D.height;
    const weaponWidth = weapon.getCurrentImage2D.width * screenHeightFraction * Weapon.WEAPON_ZOOM;
    const weaponHeight = weapon.getCurrentImage2D.height * screenHeightFraction * Weapon.WEAPON_ZOOM;

    let wx = (this.canvas.width - weaponWidth) * 0.5;
    let wy = this.canvas.height - weaponHeight;

    if (player.hasMoved()) {
      wx += (Math.sin(bobSpeed * time * player.getPaces * (1 / time)) * bobSway);
      wy += Math.abs(Math.cos(bobSpeed * time * player.getPaces * (1 / time)) * bobSway);
    }
    this.context.drawImage(weapon.getCurrentImage2D.image, wx, wy, weaponWidth, weaponHeight);
  }

  /**
   * Sets up the color gradient on the graphics context for drawing
   * @param {ColorGradient} colFloorGradient - Coloring of the floor from close to far away
   */
  private setUpFloorGradient(colFloorGradient: ColorGradient): void {
    let gradient = this.context.createLinearGradient(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, this.canvas.height);
    gradient.addColorStop(1, colFloorGradient.near);
    gradient.addColorStop(0, colFloorGradient.far);
    this.context.fillStyle = gradient;
  }

  /**
   * Sets up the color gradient on the graphics context for drawing
   * @param {ColorGradient} colFloorGradient - Coloring of the floor from close to far away
   */
  private setUpCeilingGradient(colFloorGradient: ColorGradient): void {
    let gradient = this.context.createLinearGradient(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height / 2);
    gradient.addColorStop(0, colFloorGradient.near);
    gradient.addColorStop(1, colFloorGradient.far);
    this.context.fillStyle = gradient;
  }

  /**
   * Draws the {@link Enemy} name tag on screen.
   * @param position 
   * @param distanceFactor 
   */
  private drawNameTag(position: Vec2D, distanceFactor: number, enemyName: string) {
    const effectiveFontSize = distanceFactor * Renderer.FONT_BASE_SIZE;
    this.context.font = `${effectiveFontSize}px ${Renderer.FONT_NAME}`;
    this.context.fillStyle = Renderer.FONT_COLOR;
    this.context.fillText(enemyName, position.x, position.y);
  }

  /**
   * Draws all enemies in the given list.
   * @param enemies list of {@link Enemy} objects.
   * @param player {@link Player} reference.
   */
  private drawEnemyList(enemies: Enemy[], player: Player) {
    // Position at which we draw the sprite:
    const drawPos = new Vec2D(0, this.canvas.height / 2);
    let sprite: Enemy;
    // distance between the player and the sprite:
    let distance: number;
    // note that the angle may not be set (===false) because sprite is outside our vision:
    let angle: boolean | number;
    // the factor with which we scale the size of the sprite (the more far away, the smaller it gets):
    let distanceSizeScalingFactor: number;
    // How much the sprite's x coordinate on screen deviates from the middle of the screen:
    let horizontalDeviationFactor: number;

    // Which bar we're checking against for depth:
    let barIndex: number;

    // Depth (distance) of the current bar at the current angle:
    let currentBarDepth: number;

    // Width and height of sprites to be drawn
    let spriteWidth: number;
    let spriteHeight: number;

    this.context.globalAlpha = 1;

    // Collect all sprites and iterate through them.
    for (let i = 0, len = enemies.length; i < len; i++) {
      sprite = enemies[i];
      // Distance sprite<->player:
      distance = MathHelper.euclideanDistance(sprite.getPosition, player.getPosition);
      if (distance > this.drawDistance) {
        // Sprite is beyond the drawing distance, so we totally skip drawing it:
        continue;
      }
      angle = MathHelper.vectorInViewCheck(player.getPosition, player.getDirection, sprite.getPosition, this.halfFieldOfView)
      
      if (angle !== false) {
        // Start out with middle of screen:
        // How much the object deviates from our center of view on x:
        
        horizontalDeviationFactor = MathHelper.signedAngleBetween(player.getDirection, angle as number);
        
        // Deviation added to center of view:
        drawPos.x = (this.canvas.width / 2) + this.screenRatio * horizontalDeviationFactor;

        // distance to camera of bar at approximately drawPos.x
        barIndex = drawPos.x - (drawPos.x % this.spacing);
        currentBarDepth = this.barDepthBuffer[barIndex];

        // Check if a bar was already drawn closer to the camera than the sprite.
        // Or the angle where a bar would be is unset entirely
        if (currentBarDepth < distance || currentBarDepth == undefined) {
          continue; //<-- wall overlaps sprite, skip drawing sprite completely
        }

        // Zoom factor, the size of the sprite gets smaller the more far away it is:
        distanceSizeScalingFactor = 1 / (distance * Math.cos(angle as number - player.getDirection));

        // Update player viewing angle in sprite to help calculating which image will be sent back.
        sprite.lastPlayerViewingAngle = angle as number;
        spriteWidth = sprite.getSprite().width * distanceSizeScalingFactor;
        spriteHeight = sprite.getSprite().height * distanceSizeScalingFactor;

        // Finally, draw the image with the parameters above:
        const drawPositionWithOffset = new Vec2D(drawPos.x - (spriteWidth / 2), drawPos.y - (spriteHeight / 3))
        this.context.drawImage(sprite.getSprite().image,
          drawPositionWithOffset.x, drawPositionWithOffset.y,
          spriteWidth, spriteHeight
        );

        // Display name tag
        if (sprite.getPlayerInfo.getUserName && !sprite.getPlayerInfo.isDead) {
          this.drawNameTag(drawPositionWithOffset, distanceSizeScalingFactor, sprite.getPlayerInfo.getTruncatedUserName);
        }
      }
    }
  }

  /**
   * Draw sprites stored in a room in respect to the players position, direction, and the renderers drawing distance.
   */
  private drawSprites(room: Room, player: Player) {
    // this.drawSpriteList(room.getSprites, player); TODO: Remove because we removed sprites
    this.drawEnemyList(room.getEnemies, player);
  }

  /**
   * Draw the walls.
   * 
   * @param {Room} room - Room is the source of walls
   * @param {Player} player - Player used mainly for positioning and look direction
   */
  private drawWalls(room: Room, player: Player): void {
    this.context.save();
    // Cast ray for each bar, depending on resolution
    for (let bar = 0; bar < this.resolution; bar++) {
      // On the unit circle, determine the bar's position on the x-axis, ranging from -0.5 to 0.5:
      let xAxisPosition = bar / this.resolution - 0.5;
      // Use this along with the focal length as y-axis to calculate the angle of the ray that will be casted:
      let rayAngle = Math.atan2(xAxisPosition, this.focalLength);
      // Cast rays and get back the steps it too until it ran out of draw distance:
      let steps = room.getMap.rayCast(player.getPosition, player.getDirection + rayAngle, this.drawDistance);
      // Finally, draw the bar corresponding to the ray, ofcourse only if it hit MapElementType.WALL or above:
      this.drawBar(room, bar, steps, rayAngle, player);
    }
    this.context.restore();
  }

  /**
   * Draw floor as a gradient rectangle covering the bottom half of the screen.
   * Rendering order is between skybox and walls for desired effect.
   */
  private drawFloor(): void {
    this.setUpFloorGradient(this.floorGradient);
    this.context.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
  }

  private drawCeiling(): void {
    this.setUpCeilingGradient(this.ceilingGradient);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
  }

  /**
   * Draw a single bar. Remember that multiple bars add up to a wall
   * @param {Room} room - Needed for wall texture resources
   * @param {number} bar - The n'th bar we're drawing up to this.resolution
   * @param {Step[]} steps - The individual steps the ray took
   * @param {number} rayAngle - In radians, what the ray is angled from the player
   */
  private drawBar(room: Room, bar: number, steps: Step[], rayAngle: number, player: Player): void {
    // Texture to use to paint the wall:
    let texture;
    // where the left side of the wall will be drawn:
    const left = Math.floor(bar * this.spacing);
    // how wide the bar will be
    const width = Math.ceil(this.spacing);
    // used to keep track which step in the ray hit the wall (step index):
    let stepIndexHit = -1;

    // Skip over the rays that haven't hit a Wall or similar and keep track of the index where they did hit:
    while (++stepIndexHit < steps.length && steps[stepIndexHit] != undefined && steps[stepIndexHit].mapElement.getType() !== MapElementType.WALL);

    // Try from the back down to the ray step nearest to the player to draw the bar that hit a wall:
    for (let s = steps.length - 1; s >= 0; s--) {
      let step = steps[s];
      // wall hit:
      if (s === stepIndexHit && step != undefined) {
        texture = step.mapElement.getWallImage;
        // x coordinate offset for drawing the texture:
        let textureX = Math.floor(texture.width * step.offset);
        // we want ot know where we start drawing the wall on the y axis and how tall it is:
        let wall = this.calculateWall(step.mapElement.getType(), rayAngle, step.distance);

        // in our bar depth buffer, update what distance this bar was last rendered at:
        this.barDepthBuffer[left - (left % this.spacing)] = step.distance;

        this.context.globalAlpha = 1; // full brightness for drawing the bar
        // Finally, draw the bar:
        this.context.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);

        // Check if map has fog of war, render if present
        if (room.getMap.getFog) {
          // Make walls drawn further back darker for basic shading:
          this.context.fillStyle = room.getMap.getFog.color;
          // The farther the step that hit is, the lower the alpha for drawing should be:
          let currentAlpha = Math.max((step.distance) / (room.getMap.getFog.distance), 0);

          // Render fog if below engage threshold
          if (currentAlpha > room.getMap.getFog.engage) {
            this.context.globalAlpha = Math.max((step.distance) / (room.getMap.getFog.distance), 0) - room.getMap.getFog.engage;
            // Draw rectangle identical to the drawImage above just to shade it in the fog color:
            this.context.fillRect(left, wall.top, width, wall.height);
          }
        }


        if (player.getWeapon.isMuzzleFlashOngoing) {
          this.context.fillStyle = player.getWeapon.getMuzzleFlashColor;
          this.context.globalAlpha = (1 / (1 + step.distance));
          this.context.fillRect(left, wall.top, width, wall.height);
        }
      }
    }
  }

  /**
   * Calculate bottom, top and height of wall.
   * 
   * @param {number} height - Height of current bar. WARNING: TODO BUG currently will only
   * draw correctly walls as walls, if we add another wall type with the ENUM
   * ID 2, then it may cause issues.
   * @param {number} angle - Angle of current bar.
   * @param {number} distance - Distance to the bar.
   * @returns Top x coordinate where the wall begins and how tall it is (height)
   */
  private calculateWall(height: number, angle: number, distance: number) {
    // Player height relative to the walls:
    const playerHeight = 1;

    // Player looks straight, parallel to the floor. This can be adjusted from a range of -1 to 1:
    /* TODO
      if we decide playerLookPitch is non-zero, then we must adjust the
      floor's y-axis accordingly because it'll result in the walls lookin
      like they're floating in the air.
    */
    const playerLookPitch = 0;

    // Calculate distance with fisheye correction.
    // The idea behind this: by multiplying by the cosine of the angle, we'll end up with the bars closer to edges of the screen appearing smaller, and thus corrected.
    // Without this, we'll get the fisheye effect where the peripheral vision looks bloated (think of the skating videos from the 90s)up
    const fishEyeCorrection = distance * Math.cos(angle) /*skyscraper mode: * 0.1*/;

    // Calculate wall height (fisheye corrected).
    const wallHeight = this.canvas.height * height / fishEyeCorrection;

    // Calculate where the wall begins on the y axis. We place it through the x1x2 horizontal plane:
    const wallFloor = this.canvas.height / 2 * ((1 + playerLookPitch) + playerHeight / fishEyeCorrection);

    return {
      top: wallFloor - wallHeight,
      height: wallHeight /*skyscraper mode: /1.8*/
    }
  }

  /**
   * Drawing the skybox which encompasses both sky and floor.
   * @param {number direction - Viewing angle in radients. (Totally rad)
   */
  private drawSkyBox(skybox: Image2D, direction: number): void {
    const width = skybox.width * (this.canvas.height / skybox.height) * 2;
    // Calculate where the skybox texture starts, note that this allows for infinitely repeated skyboxes
    const left = (direction / MathHelper.CIRCLE) * -width;

    this.context.save();
    this.context.drawImage(skybox.image, left, 0, width, this.canvas.height);

    // Check for background scroll repeat
    if (left < width - window.innerWidth * 0.5) {
      this.context.drawImage(skybox.image, left + width, 0, width, this.canvas.height);
    }

    this.context.restore();
  }

  private drawCrosshair(radius: number = 15, size: number = 10, thickness: number = 3, color: string = Renderer.CROSSHAIR_COLOR): void {
    this.context.save();
    this.context.fillStyle = color;
    this.context.fillRect(this.canvas.width / 2 - radius - size, this.canvas.height / 2,
      size, thickness
    );
    this.context.fillRect(this.canvas.width / 2 + radius, this.canvas.height / 2,
      size, thickness
    );

    this.context.fillRect(this.canvas.width / 2 - (thickness / 2), this.canvas.height / 2 + radius,
      thickness, size
    );
    this.context.restore();
  }

  /**
   * Changes the resolution to enable dynamic resolution scaling.
   * @param delta By how much we change the current resolution.
   */
  public changeResolution(delta: number) {
    const newResolution = this.resolution + delta;
    if (((this.canvas.width / 10) <= newResolution) && (this.canvas.width > newResolution)) {
      this.resolution = newResolution;
      this.spacing = this.canvas.width / newResolution;
      this.barDepthBuffer = new Array<number>(this.canvas.width);
    }
  }

  /**
   * Shows an animation in case the {@link Player} is defeated.
   */
  public deathScreen() {
    this.context.fillStyle = Renderer.DEATH_SCREEN_COLOR;
    this.context.globalAlpha = Renderer.DEATH_SCREEN_MAX_OPACITY;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public get getResolution() : number {
    return this.resolution;
  }
}
