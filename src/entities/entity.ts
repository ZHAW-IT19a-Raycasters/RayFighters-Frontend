import { Vec2D } from "../common/vec2d";

/**
 * Superclass for entities (Objects/Players in the game) like Sprites and Enemies.
 */
export abstract class Entity {
    /**
     * Position on the map.
     */
    protected position: Vec2D;

    /**
     * Direction the sprite is facing in radiants.
     */
    protected angle: number;

    /**
     * Last angle this sprite was viewed from the perspective of the player.
     */
    public lastPlayerViewingAngle: number;
    
    constructor() {
        this.lastPlayerViewingAngle = 0;
        this.angle = 0;
        this.position = new Vec2D(1, 1);
    }

    public get getPosition(): Vec2D {
        return this.position;
    }

    public get getAngle(): number {
        return this.angle;
    }

    public set setAngle(angle: number) {
        this.angle = angle;
    }

    public set setPosition(position: Vec2D) {
        this.position = position;
    }
}