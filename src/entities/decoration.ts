import { Image2D } from "../rendering/renderer";
import { Vec2D } from "../common/vec2d";
import { Sprite } from "./sprite";
import { EntityType } from "./entity";

export class Decoration extends Sprite {
    constructor(position: Vec2D, imagePath: string){
        super(new Array<Image2D>(new Image2D(imagePath, 1024, 2048)), EntityType.DECORATION);
        super.setPosition = position;
    }
}