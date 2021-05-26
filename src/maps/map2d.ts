import { Vec2D } from "../common/vec2d";
import { Raycaster, Step } from "../rendering/raycaster";
import { ColorGradient, Image2D } from "../rendering/renderer";
import { Fog } from "../rendering/fog";

export class Map2D {
    private static readonly SKYBOX_WIDTH = 3512;
    private static readonly SKYBOX_HEIGHT = 1440;
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
     * Map data according to wiki, see https://github.zhaw.ch/raycasters/docs/wiki/Map
     */
    private mapName: string;
    private skyBox: Image2D;
    private ceilingGradient: ColorGradient;
    private floorGradient: ColorGradient;
    private mapSize: number;
    private wallTextures: Map<string, Image2D>;
    private fog: Fog;

    /**
     * Size refers to the height and width of the map (it's square)
     */
    constructor(private size?: number) {
        if (size) {
            this.map = new Array<MapElement>(size ** 2);
        }

        this.raycaster = new Raycaster(this);
        this.wallTextures = new Map<string, Image2D>();
    }

    /**
     * Queries the element of a map at clamped coordinate (x,y), could be wall,
     * floor, etc..
     * 
     * @param x horizontal coordinate of the map
     * @param y vertical coordinate of the map
     * @returns The ELEMENT of map at (x,y) ONLY if it's inside the map, othertype MapElementType.NONE (!)
     */
    public getElementByPosition(pos: Vec2D): MapElement {
        pos.floor();
        if (pos.x < 0 || pos.x > this.size - 1 || pos.y < 0 || pos.y > this.size - 1) {
            // If the coordinate x or y is outside of the map, then return the
            // non-existant map element type:
            return new MapElement(MapElementType.NONE);
        }
        return this.map[pos.y * this.size + pos.x];
    }

    /**
     * Asynchronous method to read the map file.
     * @param filename Name of map file
     * @returns 
     */
    private readMap(filename: string, readFromFile?: any): string {
        // Normal routine
        if (typeof process === 'undefined') {
            var request = new XMLHttpRequest();
            request.open('GET', filename, false);  // `false` makes the request synchronous
            request.send(null);

            if (request.status === 200) {
                return request.responseText;
            } else {
                return "";
            }
        }
        return readFromFile(filename);
    }

    /**
     * Load and parse map file according to our map definition.
     * Don't edit this method unless you know the map syntax:
     * https://github.zhaw.ch/raycasters/docs/wiki/Map#example
     * 
     * @param filename Filepath to string
     */
    public parseMapData(filename: string, readFromFile?: any): void {
        const map = this.readMap(filename, readFromFile);
        const lines = map.split('\n');

        // First line is always the map name
        this.mapName = lines[0];
        // Next line defines the skybox file name
        this.skyBox = new Image2D(lines[1], Map2D.SKYBOX_WIDTH, Map2D.SKYBOX_HEIGHT);

        // The next line can be empty or contains the ceiling color gradient
        if (lines[2].trim().length > 0) {
            const ceilingSplit = lines[2].split(";");
            this.ceilingGradient = new ColorGradient(ceilingSplit[0], ceilingSplit[1]);
        }

        // The next line can be empty or contains the floor color gradient
        if (lines[3].trim().length > 0) {
            const floorSplit = lines[3].split(";");
            this.floorGradient = new ColorGradient(floorSplit[0], floorSplit[1]);
        }

        // Then comes the fog properties of the map
        if (lines[4].trim().length > 0) {
            const fogSplit = lines[4].split(";");
            this.fog = new Fog(fogSplit[0], parseInt(fogSplit[1]), parseFloat(fogSplit[2]));
        }

        // Next line defines the map size (height=width => square map)
        this.mapSize = parseInt(lines[5]);

        // Skip ahead after the map definition and fetch the amount of wall textures
        const numberOfWallTextures = parseInt(lines[6 + this.mapSize]);

        // Parse wall textures. Note that although this comes AFTER in the map
        // file, we need it NOW because we can't parse the map otherwise.
        for (let index = 0; index < numberOfWallTextures; index++) {
            let textureData = lines[index + 7 + this.mapSize].split("=");
            this.wallTextures.set(textureData[0].trim(), new Image2D(textureData[1].trim(), 2048, 2048));
        }

        this.map = new Array<MapElement>(this.mapSize ** 2);

        // Parse the actual map now
        let x = 0;
        for (let index = 6; index < 6 + this.mapSize; index++) {
            const line = lines[index];
            for (const char of line) {
                if (char === '\r') {
                    // Newline, nothing happened here so we decrement x to "retry" next line
                    x--;
                } else {
                    // At this location we've got a wall or floor
                    if (char.match("([1-9])|([A-Z])")) { // Check if it's a wall
                        this.map[x] = new MapElement(MapElementType.WALL);
                        this.map[x].setWallImage = this.wallTextures.get(char);
                    } else if (char === "0") { // Else it's a floor
                        this.map[x] = new MapElement(MapElementType.FLOOR);
                    }
                }
                x++;
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

    /**
     * Probably best used for debugging on the console.
     * @returns String representation of the map.
     */
    public toString(): string {
        let str: string = '   '
        for (let i = 0; i < this.getSize; i++) { str += `${i} ` }
        str += '\n';

        for (let i = 0, row = 0; i < this.map.length; i++) {
            const colIndex = i % this.getSize;
            const elem = this.map[i].getType();
            if (colIndex === 0) {
                str += `${row} [${elem} `;
                ++row;
            } else if (colIndex === this.getSize - 1) {
                str += `${elem}]\n`
            } else {
                str += `${elem} `
            }
        }
        return str;
    }

    public get getElements() {
        return this.map;
    }

    public get getElementCount(): number {
        return this.map.length;
    }

    /**
     * Overwrite mapelement at position in this map.
     * 
     * @param pos Position of map element
     * @param newElem New map element
     */
    public setElement(pos: Vec2D, newElem: MapElement): void {
        pos.floor();
        if (pos.x >= 0 && pos.x <= this.size - 1 && pos.y >= 0 && pos.y <= this.size - 1) {
            this.map[pos.y * this.size + pos.x] = newElem;
        }
    }

    public get getSize(): number {
        return this.size;
    }


    public get getSkyBox(): Image2D {
        return this.skyBox
    }


    public get getCeilingGradient(): ColorGradient {
        return this.ceilingGradient;
    }

    public get getFloorGradient(): ColorGradient {
        return this.floorGradient;
    }

    public get getFog(): Fog {
        return this.fog
    }

    public get getMapName(): string {
        return this.mapName;
    }
}

/**
 * Used to descripe the map elements
 * TODO: If there's enough time, expand this into a class to make the map more
 * interactive.
 */
export enum MapElementType {
    NONE = -1,  //< Outside of the map
    FLOOR = 0,  //< Floor, inside of the map
    WALL = 1,   //< Wall
}

/**
 * Data class for a MapElement
 * Note that a MapElement is defined as one square in a map. In a size=32 map
 * there's 32^2 MapElements.
 */
export class MapElement {
    private type: MapElementType;
    private wallImage: Image2D;

    constructor(type: MapElementType, ) {
        this.type = type;
    }

    public getType(): MapElementType {
        return this.type;
    }

    public get getWallImage(): Image2D {
        return this.wallImage;
    }

    public set setWallImage(i: Image2D) {
        this.wallImage = i;
    }
}
