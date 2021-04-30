import { Map2D, MapElementType } from './map2d';
import { Image2D } from '../rendering/renderer';
import { Enemy } from '../sprites/enemy';
import { Sprite } from '../sprites/sprite';
import { Vec2D } from '../common/vec2d';
import { PlayerInfo } from '../communication/playerinfo';


/**
 * Managing class of a map, adds functionality used for the game such as
 * raycasting.
 */
export class Room {
    private map: Map2D;
    private skyBox: Image2D;
    private sprites: Sprite[];
    private enemies: Enemy[];
    // private enemies: Enemy[]; TODO Maybe keep?

    constructor({ mapSize, isRandomized = false, loadMap }: { mapSize: number; isRandomized?: boolean; loadMap?: string; }) {
        this.map = new Map2D(mapSize);
        this.sprites = new Array<Sprite>();

        if (loadMap) {
            this.map.parseMapData(loadMap);
        } else if (isRandomized) {
            this.map.randomize();
        } else {
            this.map.initialize();
        }

        // Add sprites from map to sprite array
        for (let index = 0; index < this.map.getElements.length; index++) {
            if (this.map.getElements[index].getType() === MapElementType.SPRITE) {
                this.sprites.push(this.map.getElements[index].getSprite);
                // console.log("Sprite added. Position:" + this.map.getElements[index].getSprite.getPosition.toString())
            }
        }

    }

    public get getMap(): Map2D {
        return this.map;
    }

    public get getSprites(): Sprite[] {
        return this.sprites;
    }

    public get getEnemies(): Enemy[] {
        return this.enemies;
    }

    public updateSpriteMap(enemies: Array<Enemy>){
        this.enemies = enemies;
    }
}