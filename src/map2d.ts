import { Vec2D } from "./vec2d";
import { Raycaster, Step } from "../src/raycaster";

class Map2D {
    /**
     * An array describing the map (whether a cell has a wall or
     * not): wall = 1, floor = 0
     * 
     * Note that the world is basically 2D, but saved as 1D in the array.
     */
    private map: Array<MapElement>;

    /**
     * To shoot rays and find out where they hit on (this) map.
     */
    private raycaster: Raycaster;

    /**
     * size refers to the height and width of the map (it's square)
     */
    constructor(private size: number) {
        this.map = new Array<MapElement>(size**2);
        this.raycaster = new Raycaster(this);
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
    public getElem(pos: Vec2D): MapElement {
        pos.floor();
        if (pos.x < 0 || pos.x > this.size - 1 || pos.y < 0 || pos.y > this.size - 1) {
            // If the coordinate x or y is outside of the map, then return the
            // non-existant map element type:
            throw new Error(`No MapElement at (${pos.x},${pos.y}).`);
        }
        return this.map[pos.y * this.size + pos.x];
    }

    public setElem(pos: Vec2D, newElem: MapElement): void {
        pos.floor();
        if(pos.x >= 0 && pos.x <= this.size - 1 && pos.y >= 0 && pos.y <= this.size - 1) {
            this.map[pos.y * this.size + pos.x] = newElem;
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

    /**
     * name
     */
    public rayCast(origin: Vec2D, angle: number, range: number): Step[] {
        // x: length of the opposite in the triangle
        // y: length of the adjacent in the trangle
        const direction = new Vec2D(Math.cos(angle), Math.sin(angle))
        const initialStep = new Step(origin, 0, new MapElement(MapElementType.NONE), 0);

        // Update raycaster parameters:
        this.raycaster.dir = direction;
        this.raycaster.range = range;

        // Recursively build up steps until ray hits something:
        return this.raycaster.ray(initialStep);
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