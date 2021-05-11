import { Map2D, MapElementType } from './map2d';
import { Sprite } from '../entities/sprite';
import { Entity } from '../entities/entity';
import { Enemy } from '../entities/enemy';


/**
 * Managing class of a map, adds functionality used for the game such as
 * raycasting.
 */
export class Room {
    /**
     * Map (walls, etc) this room has
     */
    private map: Map2D;

    /**
     * 2D decals shown on the map
     */
    private sprites: Sprite[];

    /**
     * Enemies on the map
     */
    private enemies: Enemy[];

    /**
     * 
     * @param param0 Mapsize (width=height) and whether we randomize the map.
     * Also allows the map to be loaded dynamically from file.
     */
    constructor({ mapSize, isRandomized = false, loadMap }: { mapSize: number; isRandomized?: boolean; loadMap?: string; }) {
        this.map = new Map2D(mapSize);
        this.sprites = new Array<Sprite>();

        if (loadMap) {
            // Load map from file
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
            }
        }

    }

    public get getMap(): Map2D {
        return this.map;
    }

    public get getSprites(): Entity[] {
        return this.sprites;
    }

    public get getEnemies(): Entity[] {
        return this.enemies;
    }

    /**
     * Since this is a multiplayer game, we want to let someone external (eg
     * server) update the enemies.
     * @param enemies Array of updated enemies
     */
    public updateEnemyEntities(enemies: Array<Enemy>){
        this.enemies = enemies;
    }

    /**
     * Run timekeeping updates in our enemies.
     * 
     * @param time Time passed in seconds
     */
    public updateEnemies(time: number){
        for (let index = 0; index < this.enemies.length; index++) {
            this.enemies[index].update(time);            
        }
    }
}