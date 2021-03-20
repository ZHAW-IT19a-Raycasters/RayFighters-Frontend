import { Map2D, MapElement, MapElementType } from "./map2d";
import { Vec2D } from "./vec2d";

/**
 * Performs raycasting on a map
 * Aka shoots a ray and tells you where it hits
 */
export class Raycaster {
    /**
     * Direction of the ray that's currently being worked on
     * (cos, sin)
     */
    private currentDir: Vec2D;
    private currentRange: number;

    /**
     * 
     * @param map The map that will be raycasted on
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
        if(nextStep.distance > this.currentRange) {
            return [origin];
        }
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
 * 
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