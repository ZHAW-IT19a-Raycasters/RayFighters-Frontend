import { Image2D } from "../renderer";
import { Sprite, SpriteType } from "./sprite";
import { Vec2D } from "../vec2d";

export class Enemy extends Sprite {
    private userID: number;

    constructor(userID: number, position: Vec2D){
        // TODO: Remove static placement
        super(new Vec2D(4, 4), new Array<Image2D>(new Image2D('assets/enemies/placeholder.png', 1024, 2048)), SpriteType.ENEMY);
        this.userID = userID;
    }
}
