import { Image2D } from "../rendering/renderer";
import { Vec2D } from "../common/vec2d";
import { Sprite } from "./sprite";
import { EntityType } from "./entity";

export class Decoration extends Sprite {
    constructor(position: Vec2D, image: Image2D){
        super(new Array<Image2D>(new Image2D('assets/enemies/placeholder.png', 1024, 2048)), EntityType.DECORATION);
    }
}