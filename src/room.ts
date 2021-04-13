import { Map2D } from './map2d';
import { Image2D } from './renderer';
import { Sprite } from './sprites/sprite';


/**
 * Managing class of a map, adds functionality used for the game such as
 * raycasting.
 */
export class Room {
    private map: Map2D;
    private skyBox: Image2D;
    private wallImages: Image2D[];
    private sprites: Sprite[];

    constructor({ mapSize, isRandomized = false, loadMap }: { mapSize: number; isRandomized?: boolean; loadMap?: string; }) {
        this.map = new Map2D(mapSize);

        if (loadMap) {
            this.map.fromText(loadMap);
        } else if (isRandomized) {
            this.map.randomize();
        } else {
            this.map.initialize();
        }
        this.sprites = new Array<Sprite>();
        this.wallImages = new Array<Image2D>();
    }

    public get getMap() : Map2D {
        return this.map;
    }

    public setSkyBox(skybox: any): void {
        this.skyBox = skybox;
    }

    public get getSkyBox() : Image2D {
        return this.skyBox;
    }
    
    public get getWallImages() : Image2D[] {
        return this.wallImages;
    }
    
}