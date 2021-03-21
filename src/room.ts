import { Map2D, MapElement, MapElementType } from './map2d';
import { Image2D } from './renderer';


/**
 * Managing class of a map, adds functionality used for the game such as
 * raycasting.
 */
class Room {
    private map: Map2D;
    private skyBox: Image2D;
    private wallImages: Image2D[];

    constructor(mapSize: number, isRandomized: boolean = false) {
        this.map = new Map2D(mapSize);

        if(isRandomized) {
            this.map.randomize();
        } else {
            this.map.initialize();
        }

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


export { Room };