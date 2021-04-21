/**
 * Fog of War class. Enables fog rendering in a dynamic manner.
 */
export class Fog {
    /**
     * Color of the FOW (fog of war)
     */
    public color: string;
    
    /**
     * The distance (in wall 'blocks') after which the color will have 100% intensity.
     */
    public distance: number;

    /**
     * Threshold that defines at what distance the fog gets blended in. Ranges from 0 to 1.
     */
    public engage: number
    
    constructor (color: string, distance: number, engage: number){
        this.color = color;
        this.distance = distance;
        this.engage = engage > 1 ? 1 : engage;
    }
}