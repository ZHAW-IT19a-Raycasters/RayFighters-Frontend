import { Map2D, MapElement, MapElementType } from './map2d';


/**
 * Managing class of a map, adds functionality used for the game such as
 * raycasting.
 */
class Room {
    private map: Map2D;

    constructor(mapSize: number, isRandomized: boolean = false) {
        this.map = new Map2D(mapSize);

        if(isRandomized) {
            this.map.randomize();
        } else {
            this.map.initialize();
        }
    }

    public get getMap() : Map2D {
        return this.map;
    }
    
}


export { Room };