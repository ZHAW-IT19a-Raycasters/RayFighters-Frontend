import { Image2D } from "../rendering/renderer";
import { Sprite, SpriteType } from "./sprite";
import { Vec2D } from "../common/vec2d";
import { MathHelper } from "../common/mathhelper";

export class Enemy extends Sprite {
    private userID: number;

    constructor(userID: number, position: Vec2D){
        // TODO: Remove static placement
        super(
            new Vec2D(position.x, position.y), 
            new Array<Image2D>(
                new Image2D('assets/enemies/female/front_1.png', .4 * 1024, .4 * 2048),
                new Image2D('assets/enemies/female/side_r_1.png', .4 * 1024, .4 * 2048),
                new Image2D('assets/enemies/female/back_1.png', .4 * 1024, .4 * 2048),
                new Image2D('assets/enemies/female/side_l_1.png', .4 * 1024, .4 * 2048)
            ),
            SpriteType.ENEMY);
        this.userID = userID;
    }

    public get getUserID(): number {
      return this.userID;
    }


    public getSprite(): Image2D {
        const lookDirection = Math.abs(this.direction - this.lastPlayerViewingAngle);
        
        // Check east
        if ((lookDirection > MathHelper.NORTH + MathHelper.EIGHTH_OF_CIRCLE && lookDirection < MathHelper.CIRCLE) || (lookDirection <= MathHelper.SOUTH - MathHelper.EIGHTH_OF_CIRCLE && lookDirection >= MathHelper.EAST)) {
            return this.sprites[1]; 
        }

        // Check south
        if (lookDirection > MathHelper.SOUTH - MathHelper.EIGHTH_OF_CIRCLE && lookDirection <= MathHelper.WEST - MathHelper.EIGHTH_OF_CIRCLE) {
            return this.sprites[2]; 
        }
        
        // Check west
        if (lookDirection > MathHelper.SOUTH + MathHelper.EIGHTH_OF_CIRCLE && lookDirection <= MathHelper.NORTH - MathHelper.EIGHTH_OF_CIRCLE) {
            return this.sprites[3]; 
        }

        return this.sprites[0];
    }
}
