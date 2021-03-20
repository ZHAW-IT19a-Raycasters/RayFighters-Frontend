/**
 * A 2D vector data class containing an x and a y coordinate.
 */
export class Point2D {
    constructor(public x: number, public y: number) { }

    /**
     * Round down to integer (throw away decimals)
     * Used in maps to "go" to the origin of the map tile/element
     */
    public floor(): void {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }
}