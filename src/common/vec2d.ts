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

    /**
     * Normalize vector to length = 1
     * @returns the normalized 2d vector
     */
    public get getNormalized(): Vec2D {
        const norm = Math.sqrt(this.x**2 + this.y**2);
        const normalized = new Vec2D(this.x, this.y);
        normalized.x /= norm;
        normalized.y /= norm;
        return normalized;
    }

    /**
     * 
     * @param {Vec2D} minuend - The vector which we use to subtract from (this)
     * @returns Subtrahend: Copy of difference of vectors
     */
    public getDifference(minuend: Vec2D): Vec2D {
        return new Vec2D(this.x - minuend.x, this.y - minuend.y);
    }

    /**
      * To String method
      * @returns string with x and y elements
      */
    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}
