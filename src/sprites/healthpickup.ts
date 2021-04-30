import { Player } from "../player/player";
import { Image2D } from "../rendering/renderer";
import { Sprite, SpriteType } from "./sprite";

export class HealthPickup extends Sprite {
    private static readonly HEALTH_AMOUNT: number = 25;

    constructor(){
        // TODO: Add static image
        super(new Array<Image2D>(new Image2D('assets/pickups/syringe.png', 1024, 2048)), SpriteType.HEALTH_PICKUP);
    }
}
