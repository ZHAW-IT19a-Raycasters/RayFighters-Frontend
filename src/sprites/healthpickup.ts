import { Player } from "../player/player";
import { Image2D } from "../rendering/renderer";
import { Vec2D } from "../common/vec2d";
import { Sprite, SpriteType } from "./sprite";

export class HealthPickup extends Sprite {
    private HEALTH_AMOUNT: number = 25;

    constructor(position: Vec2D){
        // TODO: Add static image
        super(position, new Array<Image2D>(new Image2D('assets/pickups/medkit.png', 1024, 2048)), SpriteType.HEALTH_PICKUP);
    }

    public trigger(player: Player) {
        // Demo code:
        // player.health += HEALTH_AMOUNT
        // TODO: Make sure pickup disappears for a fixed amount of time
    }
}
