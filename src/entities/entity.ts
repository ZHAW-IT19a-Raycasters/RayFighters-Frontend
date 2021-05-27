import { Vec2D } from "../common/vec2d";
import { Image2D } from "../rendering/renderer";

/**
 * Determines what type the entitiy is, to enable distinguishing different entities on the logic side.
 */
export enum EntityType {
    ENEMY,
}

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

    /**
     * What type this entity is.
     */
    private entityType: EntityType;

    /**
     * @param {EntityType} entityType - The type of entity we're instantiating
     */
    constructor(entityType: EntityType) {
        this.lastPlayerViewingAngle = 0;
        this.angle = 0;
        this.position = new Vec2D(1, 1);
        this.entityType = entityType;
    }

    /**
     * Getter for position
     */
    public get getPosition(): Vec2D {
        return this.position;
    }

    /**
     * Getter for the looking angle
     */
    public get getAngle(): number {
        return this.angle;
    }

    /**
     * Setter for the looking angle
     * @param {number} angle - angle the entity's looking at
     */
    public set setAngle(angle: number) {
        this.angle = angle;
    }

    /**
     * Setter for position
     * @param {Vec2D} position
     */
    public set setPosition(position: Vec2D) {
        this.position = position;
    }

    /**
     * Since each entity has a unique appearance (or should have for
     * aesthetics), this method should be customized!
     * Reason being that an entity can have custom animations and/or behavior.
     * @returns The current sprite this entity shall appear as.
     */
    public abstract getSprite(): Image2D;
}
