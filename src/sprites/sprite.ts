import { MathHelper } from "../mathhelper";
import { PlayerInfo } from "../packet";
import { Image2D } from "../renderer";
import { Vec2D } from "../vec2d";

/**
 * Determines what type the sprite is, to enable distinguishing different sprites on the logic side.
 */
export enum SpriteType {
    ENEMY,
    WEAPON_PICKUP,
    HEALTH_PICKUP,
    DECORATION
}

/**
 * Sprite superclass. Does all the important methods for handling 2D graphics on the 3D plane.
 */
export class Sprite {
    /**
     * Position on the map.
     */
    private position: Vec2D;

    /**
     * Direction the sprite is facing in radiants.
     */
    protected direction: number;

    /**
     * Last angle this sprite was viewed from the perspective of the player.
     */
    public lastPlayerViewingAngle: number;

    /**
     * Array of 2D sprites. Enables multiple sides (3D-esque view), arranged clock-wise.
     * 0: Front
     * 1: Right side
     * 2: Rear
     * 3: Left side
     */
    protected sprites: Array<Image2D>;

    /**
     * Type of sprite, see enum above.
     */
    private type: SpriteType;
    
    constructor(position: Vec2D, sprites: Array<Image2D>, type: SpriteType) {
        // Currently just using default placeholder sprite. 
        // TODO: Expand with front/side images
        this.sprites = sprites;

        // Currently using default position of (1|1). 
        // TODO: Setting position via server message
        this.position = position;      

        this.direction = 0;

        this.type = type;

        this.lastPlayerViewingAngle = 0;
    }

    public get getPosition(): Vec2D {
        return this.position;
    }

    public get getDirection(): number {
        return this.direction;
    }

    public set setPosition(position: Vec2D) {
        this.position = position;
    }

    public getSprite(): Image2D {
        return this.sprites[0];
    }
}
