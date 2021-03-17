class Map2D {
    /**
     * width = height of the map.
     * It's a square for now.
     */
    private size: number;

    /**
     * An array describing the map (whether a cell has a wall or
     * not): wall = 1, floor = 0
     * 
     * Note that the world is basically 2D, but saved as 1D in the array.
     */
    private map: Array<MapElement>;

    constructor(size: number) {
        this.size = size;
        this.map = new Array<MapElement>(size * size);
    }

    /**
     * Queries the element of a map at clamped coordinate (x,y), could be wall,
     * floor, etc..
     * 
     * @param x horizontal coordinate of the map
     * @param y vertical coordinate of the map
     * @returns The type of map at (x,y)
     */
    public getElemTypeAt(x: number, y: number): MapElementType {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) {
            // If the coordinate x or y is outside of the map, then return the
            // non-existant map element type:
            return MapElementType.NONE;
        }
        return this.map[y * this.size + x].getType();
    }
}

/**
 * Used to descripe the map elements
 * TODO: If there's enough time, expand this into a class to make the map more
 * interactive.
 */
enum MapElementType {
    NONE    =  -1,  //< Outside of the map
    FLOOR   =   0,  //< Floor, inside of the map
    WALL    =   1   //< Wall
}

/**
 * 
 */
class MapElement {
    private type: MapElementType;
    // TODO: plenty of room to add more interesting properties to walls or
    // floors!!

    constructor(type: MapElementType) {
        this.type = type;
    }

    public getType(): MapElementType {
        return this.type;
    }
}


export { Map2D, MapElement, MapElementType };