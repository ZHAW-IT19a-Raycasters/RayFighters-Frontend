import { Player } from "../player/player";
import { Image2D } from "../rendering/renderer";
import { Vec2D } from "../common/vec2d";
import { Sprite, SpriteType } from "./sprite";

export class WeaponPickup extends Sprite {
    constructor(position: Vec2D){
        // TODO: Add static image
        super(position, new Array<Image2D>(new Image2D('assets/enemies/placeholder.png', 1024, 1024)), SpriteType.WEAPON_PICKUP);
    }

    public trigger(player: Player){
        // TODO: Add new weapon to player and make sure pickup disappears for a given amount of time
    }
}