import { Image2D } from "../rendering/renderer";
import { Entity, EntityType } from "./entity";

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
    private type: EntityType;

    constructor(sprites: Array<Image2D>, type: EntityType) {
        super(type);
        this.sprites = sprites;
        this.type = type;
    }

    public getSprite(): Image2D {
        return this.sprites[0];
    }
}
