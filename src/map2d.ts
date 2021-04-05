import { Vec2D } from "./vec2d";
import { Raycaster, Step } from "../src/raycaster";

export class Map2D {
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

    public get getSize(): number {
        return this.size;
    }

    /**
     * Used for testing for now.
     * 
     * @returns Number of elements (walls, floors) in the map
     */
    public get getElementCount(): number {
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
            return new MapElement(MapElementType.NONE);
        }
        return this.map[pos.y * this.size + pos.x];
    }

    public setElem(pos: Vec2D, newElem: MapElement): void {
        pos.floor();
        if(pos.x >= 0 && pos.x <= this.size - 1 && pos.y >= 0 && pos.y <= this.size - 1) {
            this.map[pos.y * this.size + pos.x] = newElem;
        }
    }

    public toString(): string {
        let str: string = '   '
        for(let i = 0; i < this.getSize; i++) { str += `${i} ` }
        str += '\n';

        for(let i = 0, row = 0; i < this.map.length; i++) {
            const colIndex = i % this.getSize;
            const elem = this.map[i].getType();
            if(colIndex === 0) {
                str += `${row} [${elem} `;
                ++row;
            } else if(colIndex === this.getSize - 1) {
                str += `${elem}]\n`
            } else {
                str += `${elem} `
            }
        }
        return str;
    }

    /**
     * First simple demo map to test the map loader.
     */
    private map1 =
`00000000000000000000000000000000
01111111111111111111111111111110
01000000000000000000000000000010
01000000000000000000000000000010
01000000000000000000000000000010
01000000000000000000000000000010
01000000001111111111111000000010
01000000000000000000000000000010
01000000000000000000000000000010
01000000000000000000000000000010
01000000000000010000000000000010
01000000000000010000000000000010
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000010000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000`;

    /**
     * Still a prototype. Loads map1 into the map.
     */
    public fromText(filename: string): void {
        const file = this.map1.replace(/\n/g,'');
            let i = 0;
                for (const char of file) {
                    let num = Number(char);
                    this.map[i] = new MapElement(num as MapElementType);
                    i++;
                }
    }

    /**
     * Generate random MapElements in the map. Completely overrides existing
     * elements.
     */
    public randomize(): void {
        const WALL_THRESH = 0.25; // Probability for spawning a wall
        for (var i = 0; i < this.getElementCount; i++) {
            const rand = Math.random();
            if (rand < WALL_THRESH) {
                this.map[i] = new MapElement(MapElementType.WALL);
            } else {
                this.map[i] = new MapElement(MapElementType.FLOOR);
            }
        }
    }

    /**
     * Fill map with floors
     */
    public initialize(): void {
        for (var i = 0; i < this.getElementCount; i++) {
            this.map[i] = new MapElement(MapElementType.FLOOR);
        }
    }

    /**
     * Cast a ray from an origin point in a certain direction with a range cutoff.
     * 
     * @param origin Origin position. The player's standing position.
     * @param angle Ray shooting angle in radians. The player's direction.
     * @param range Maximum drawing distance. 1 unit = 1 MapElement.
     * @returns Array of steps composing the ray casted.
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
export enum MapElementType {
    NONE    =  -1,  //< Outside of the map
    FLOOR   =   0,  //< Floor, inside of the map
    WALL    =   1   //< Wall
}

/**
 * 
 */
export class MapElement {
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