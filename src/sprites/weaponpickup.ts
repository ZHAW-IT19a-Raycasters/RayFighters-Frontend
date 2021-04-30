import { Player } from "../player/player";
import { Image2D } from "../rendering/renderer";
import { Sprite, SpriteType } from "./sprite";

export class WeaponPickup extends Sprite {
    constructor(){
        // TODO: Add static image
        super(new Array<Image2D>(new Image2D('assets/pickups/weapon.png', 1024, 2048)), SpriteType.WEAPON_PICKUP);
    }

    public trigger(player: Player){
        // TODO: Add new weapon to player and make sure pickup disappears for a given amount of time
    }
}