import { Image2D } from "../rendering/renderer";
import { EntityType } from "./entity";
import { Sprite } from "./sprite";

export class HealthPickup extends Sprite {
    private static readonly HEALTH_AMOUNT: number = 25;

    constructor(){
        // TODO: Add static image
        super(new Array<Image2D>(new Image2D('assets/pickups/syringe.png', 1024, 2048)), EntityType.HEALTH_PICKUP);
    }
}
