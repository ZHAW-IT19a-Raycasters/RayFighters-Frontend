import { Map2D, MapElement } from "../maps/map2d";
import { Vec2D } from "../common/vec2d";

/**
 * Performs raycasting on a map
 * Aka shoots a ray and tells you where it hits
 * 
 * Documentation on the raycasting process:
 * - https://lodev.org/cgtutor/raycasting.html
 * - https://lodev.org/cgtutor/raycasting2.html
 * - https://lodev.org/cgtutor/raycasting3.html
 * - https://www.youtube.com/watch?v=eOCQfxRQ2pY
 * - https://www.playfuljs.com/a-first-person-engine-in-265-lines/
 */
export class Raycaster {
    /**
     * How far we cast rays by default. See this.currentRange.
     */
    private static readonly DEFAULT_RANGE = 8;

    /**
     * Direction of the ray that's currently being worked on
     * (x,y) = (cos, sin)
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
      * Buffer that's used to store the steps in a ray cast.
      * The idea is to not have to re allocate a whole new array
      * every time a ray is cast.
      */
    private rayBuffer: Array<Step>;

    /**
     * 
     * @param map The map that we'll cast rays on
     */
    constructor(private map: Map2D) {
        this.currentRange = Raycaster.DEFAULT_RANGE;
        this.rayBuffer = new Array<Step>(this.currentRange);
     }

    public set dir(dir: Vec2D) {
        this.currentDir = dir;
    }

    /**
      * Setter for how far we want to cast rays
      * @param {number} range
      */
    public set range(range: number) {
        this.currentRange = range;
        this.rayBuffer.length = 0;
        this.rayBuffer = new Array<Step>(range + 1);
    }

    /**
     * Calculate the next step in a ray
     *
     * @param {Step} currentStep
     * @returns next step after the current step
     */
    private calculateCurrentStep(currentStep: Step): Step {
        // Next step to take until a wall/floor border is reached (in x and y):
        const xStep = this.step(this.currentDir.y, this.currentDir.x, currentStep.pos, false);
        const yStep = this.step(this.currentDir.x, this.currentDir.y, new Vec2D(currentStep.pos.y, currentStep.pos.x), true);

        // Move to gridline that's closer:
        if(xStep.length < yStep.length) { // x closer
            return this.inspect(xStep, 1, 0, currentStep.distance, xStep.pos.y);
        }

        // y closer
        return this.inspect(yStep, 0, 1, currentStep.distance, yStep.pos.x);
    }

    /**
     * Casts a ray based off of origin parameters and this.map
     * 
     * @param {Step} origin - Starting step from where the ray is cast
     * @returns An array of steps up to the point where a wall is hit
     */
    public ray(origin: Step): Step[] {
        let nextStep = origin;
        let index = 1;
        this.rayBuffer[0] = origin;

        for (; nextStep.distance < this.currentRange; index++) {
            nextStep = this.calculateCurrentStep(nextStep);
            this.rayBuffer[index] = nextStep;
        }

        // Clear rest
        for (let ci = index + 1; ci < this.rayBuffer.length; ci++) {
            this.rayBuffer[ci] = undefined;
        }

        return this.rayBuffer;
    }

    /**
     * Calculate step for the next MapElement to be reached
     * 
     * @param {number} ySlope - y component of the ray slope
     * @param {number} xSlope - x component of the ray slope
     * @param {Vec2D} pos - From where the ray originates
     * @param {boolean} isInverted 
     * @returns Next step that has reached the next MapElement
     */
    public step(ySlope: number, xSlope: number, pos: Vec2D, isInverted: boolean) {
        let step = new Step(new Vec2D(), Infinity);
        if (xSlope !== 0) {
            // Calculate delta x and delta y needed to reach next MapElement:
            const dx = xSlope > 0 ?
                Math.floor(pos.x + 1) - pos.x :
                Math.ceil(pos.x - 1) - pos.x;
            const dy = dx * (ySlope / xSlope);

            // Effectively reached next element:
            step.pos = new Vec2D(
                isInverted ? pos.y + dy : pos.x + dx,
                isInverted ? pos.x + dx : pos.y + dy
            );

            step.length = (dx**2) + (dy**2);
        }
        return step;
    }

    /**
     * Determine mapelement we've reached with this step, what the cell offset
     * is, and what distance it currently is from the player
     * 
     * @param {Step} step - Gets us to the MapElement we want to inspect and save
     * @param {number} shiftX - Delta needed  to subtract from step position x
     * @param {number} shiftY - Delta needed to subtract from step position y
     * @param {number} distance - Distance traveled so far in the ray (by all the steps)
     * @param {number} offset - Current offset from the gridline
     * @returns 
     */
    public inspect(step: Step, shiftX: number, shiftY: number, distance: number, offset: number) {
        // determine on which axis we need to nudge to ge to the desired MapElement:
        const dx = this.currentDir.x < 0 ? shiftX : 0;
        const dy = this.currentDir.y < 0 ? shiftY : 0;

        // MapElement that the ray just hit:
        step.mapElement = this.map.getElementByPosition(new Vec2D(step.pos.x - dx, step.pos.y - dy));

        // Distance we've traveled plus the new ray:
        step.distance = distance + Math.sqrt(step.length);

        // Offset from the gridline:
        step.offset = offset - Math.floor(offset);

        return step;
    }
}

/**
 * Data class for individual raycasting steps
 */
export class Step {
    /**
     * @constructor
     * @param pos 
     * @param length 
     * @param mapElement 
     * @param distance 
     * @param offset 
     */
    constructor(public pos: Vec2D, public length: number, public mapElement?: MapElement, public distance?: number, public offset?: number) { }
}
