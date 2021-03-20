/**
 * A 2D vector data class containing an x and a y coordinate.
 */
export class Vec2D {
    constructor(public x: number = 0, public y: number = 0) { }


    /**
     * Round down to integer (throw away decimals)
     * Used in maps to "go" to the origin of the map tile/element
     */
    public floor(): void {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }
}