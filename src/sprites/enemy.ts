import { Image2D } from "../renderer";
import { Sprite, SpriteType } from "./sprite";
import { Vec2D } from "../vec2d";
import { MathHelper } from "../mathhelper";

export class Enemy extends Sprite {
    private userID: number;

    constructor(userID: number, position: Vec2D){
        // TODO: Remove static placement
        super(
            new Vec2D(4, 4), 
            new Array<Image2D>(
                new Image2D('assets/enemies/front.png', 1024, 2048),
                new Image2D('assets/enemies/right.png', 1024, 2048),
                new Image2D('assets/enemies/back.png', 1024, 2048),
                new Image2D('assets/enemies/left.png', 1024, 2048)
            ),
            SpriteType.ENEMY);
        this.userID = userID;
    }


    public getSprite(): Image2D {
        const lookDirection = Math.abs(this.direction - this.lastPlayerViewingAngle);
        document.getElementById('debug-window').innerText = 
        "Sprite direction: " + this.direction.toString()+ "\n" + 
        "player angle: " +  this.lastPlayerViewingAngle.toString() + "\n" + 
        "Look direction: " + lookDirection.toString() ;
        
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
