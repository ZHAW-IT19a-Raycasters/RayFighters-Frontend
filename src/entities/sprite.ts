import { Image2D } from "../rendering/renderer";
import { Entity } from "./entity";

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
export class Sprite extends Entity  {

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

    constructor(sprites: Array<Image2D>, type: SpriteType) {
        super();
        this.sprites = sprites;
        this.type = type;
    }

    public getSprite(): Image2D {
        return this.sprites[0];
    }
}
