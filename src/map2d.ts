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

    public getSize(): number {
        return this.size;
    }

    /**
     * Used for testing for now.
     * 
     * @returns Number of elements (walls, floors) in the map
     */
    public getElementCount(): number {
        return this.map.length;
    }

    /**
     * Queries the element of a map at clamped coordinate (x,y), could be wall,
     * floor, etc..
     * 
     * @param x horizontal coordinate of the map
     * @param y vertical coordinate of the map
     * @returns The ELEMENT of map at (x,y) ONLY if it's inside the map, othertype MapElementType.NONE (!)
     */
    public getElem(x: number, y: number): MapElement | MapElementType {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) {
            // If the coordinate x or y is outside of the map, then return the
            // non-existant map element type:
            return MapElementType.NONE;
        }
        return this.map[y * this.size + x];
    }

    public setElem(x: number, y: number, newElem: MapElement): void {
        x = Math.floor(x);
        y = Math.floor(y);
        if(x >= 0 && x <= this.size - 1 && y >= 0 && y <= this.size - 1) {
            this.map[y * this.size + x] = newElem;
        }
    }

    /**
     * Generate random MapElements in the map. Completely overrides existing
     * elements.
     */
    public randomize(): void {
        const WALL_THRESH = 0.25; // Probability for spawning a wall
        for (var i = 0; i < this.getElementCount(); i++) {
            const rand = Math.random();
            if (rand < WALL_THRESH) {
                this.map[i] = new MapElement(MapElementType.WALL);
            } else {
                this.map[i] = new MapElement(MapElementType.FLOOR);
            }
        }
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