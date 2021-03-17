/**
 * Contains the map players play in along with useful methods for rendering
 * (raycasting!)
 */
class Room {
    private size: number;
    /**
     * An array describing the map (whether a cell has a wall or
     * not): wall = 1, no wall = 0
     * 
     * Note that the world is basically 2D, but saved as 1D in the array.
     */
    private map: Uint8Array;

    constructor(size: number, ) {
        this.size = size;
        this.map = new Uint8Array(size * size);
    }

}

export { Room };