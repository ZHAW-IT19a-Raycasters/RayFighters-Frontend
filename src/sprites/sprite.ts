import { Image2D } from "../renderer";
import { Vec2D } from "../vec2d";

export class Sprite {
    private position: Vec2D;
    private direction: number;
    private sprites: Array<Image2D>;

    constructor(position: Vec2D, sprites: Array<Image2D>) {
        // Currently just using default placeholder sprite. 
        // TODO: Expand with front/side images
        this.sprites = sprites;

        // Currently using default position of (1|1). 
        // TODO: Setting position via server message
        this.position = position;      

        this.direction = 0;
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

    public getSprite() {
        // TODO: Calculate 'direction' of sprite and return the correct sprite (front/back/side left/side right)
        // Currently just returning fixed front sprite.
        return this.sprites[0];
    }
}