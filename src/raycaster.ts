import { Map2D, MapElement, MapElementType } from "./map2d";
import { Vec2D } from "./vec2d";

/**
 * Performs raycasting on a map
 * Aka shoots a ray and tells you where it hits
 * 
 * Documentation on the raycasting process:
 * - https://lodev.org/cgtutor/raycasting.html
 * - https://lodev.org/cgtutor/raycasting2.html
 * - https://lodev.org/cgtutor/raycasting3.html
 * - https://www.youtube.com/watch?v=eOCQfxRQ2pY
 */
export class Raycaster {
    /**
     * Direction of the ray that's currently being worked on
     * (cos, sin)
     * 
     * IMPORTANT: This vector needs to be set from outside BEFORE calling
     * this.ray(..). Otherwise it'll shoot the ray in the wrong direction.
     */
    private currentDir: Vec2D;

    /**
     * Raycasting range: how far do we want to cast the ray in total?
     * 
     * IMPORTANT: The raycasting range needs to be updated each time we cast a
     * ray aswell
     */
    private currentRange: number;

    /**
     * 
     * @param map The map that we'll cast rays on
     */
    constructor(private map: Map2D) { }

    public set dir(dir: Vec2D) {
        this.currentDir = dir;
    }

    public set range(range: number) {
        this.currentRange = range;
    }
    
    /**
     * Casts a ray based off of origin parameters and this.map
     * Is recursive!
     * 
     * @param origin Starting step from where the ray is cast
     * @returns An array of steps up to the point where a wall is hit
     */
    public ray(origin: Step): Step[] {
        const stepX = this.step(this.currentDir.y, this.currentDir.x, origin.pos, false);
        const stepY = this.step(this.currentDir.x, this.currentDir.y, new Vec2D(origin.pos.y, origin.pos.x), true);

        let nextStep;
        if(stepX.length < stepY.length) {
            nextStep = this.inspect(stepX, 1, 0, origin.distance, stepX.pos.y);
        } else {
            nextStep = this.inspect(stepY, 0, 1, origin.distance, stepY.pos.x);
        }

        // Draw distance: If the next step would make the total ray length
        // larger than the range, then we stop raycasting:
        if(nextStep.distance > this.currentRange) {
            return [origin];
        }

        // Recursively move onto the next step:
        return [origin].concat(this.ray(nextStep));
    }

    /**
     * 
     * @param rise 
     * @param run 
     * @param pos 
     * @param isInverted 
     * @returns 
     */
    public step(rise: number, run: number, pos: Vec2D, isInverted: boolean) {
        let ray = new Step(new Vec2D(), Infinity);
        if(run !== 0) {
            const dx = run > 0 ?
                Math.floor(pos.x + 1) - pos.x :
                Math.ceil(pos.x - 1) - pos.x;
            const dy = dx * (rise / run);
            ray.pos = new Vec2D(
                isInverted ? pos.y + dy : pos.x + dx,
                isInverted ? pos.x + dx : pos.y + dy
            );
            ray.length = (dx**2) + (dy**2);
        }
        return ray;
    }

    /**
     * 
     * @param step 
     * @param shiftX 
     * @param shiftY 
     * @param distance 
     * @param offset 
     * @returns 
     */
    public inspect(step: Step, shiftX: number, shiftY: number, distance: number, offset: number) {
        const dx = this.currentDir.x < 0 ? shiftX : 0;
        const dy = this.currentDir.y < 0 ? shiftY : 0;
        step.height = this.map.getElem(new Vec2D(step.pos.x - dx, step.pos.y - dy));
        step.distance = distance + Math.sqrt(step.length);
        // TODO shading determined by looking angle?
        step.offset = offset - Math.floor(offset);
        return step;
    }
}

/**
 * Data class for individual raycasting steps
 */
export class Step {
    /**
     * TODO comment
     * @param pos 
     * @param length 
     * @param height 
     * @param distance 
     * @param offset 
     */
    constructor(public pos: Vec2D, public length: number, public height?: MapElement, public distance?: number, public offset?: number) { }
}