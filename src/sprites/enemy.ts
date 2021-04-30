import { Image2D } from "../rendering/renderer";
import { Sprite, SpriteType } from "./sprite";
import { Vec2D } from "../common/vec2d";
import { MathHelper } from "../common/mathhelper";
import { PlayerInfo } from "../communication/playerinfo";
import { Player } from "../player/player";

export class Enemy extends Sprite {
    private playerInfo: PlayerInfo;

    constructor(){
        // TODO: Remove static placement
        super(
            new Array<Image2D>(
                new Image2D('assets/enemies/female/front_1.png', 1024, 2048),
                new Image2D('assets/enemies/female/side_r_1.png', 1024, 2048),
                new Image2D('assets/enemies/female/back_1.png', 1024, 2048),
                new Image2D('assets/enemies/female/side_l_1.png', 1024, 2048)
            ),
            SpriteType.ENEMY);
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
    
    public get getPlayerInfo() : PlayerInfo {
        return this.playerInfo
    }

    public set setPlayerInfo(playerInfo: PlayerInfo) {
        this.playerInfo = playerInfo;
    }
    
}
