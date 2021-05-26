import { Vec2D } from "./vec2d";

/**
 * Pure functions and variable definitions to aid in mathy calculations.
 */
export class MathHelper {
    /**
     * Distance from start to end in the unit circle
     */
    public static readonly CIRCLE = 2 * Math.PI;

    /**
     * Eighth of a circle, helpful for calculating viewing angle
     */
     public static readonly EIGHTH_OF_CIRCLE = Math.PI / 4;

    /**
     * Pre-Calculated N-W-S-E directions in radiants.
     * Why is that? Because our coordinate system x-axis grows to the right,
     * thus is 0 degrees at that point, visually EAST. The y-axis grows
     * downwards. So from that we deducted the following 4 directions.
     */
     public static readonly NORTH = (3 / 2) * Math.PI;
     public static readonly WEST = Math.PI;
     public static readonly SOUTH = Math.PI / 2;
     public static readonly EAST = 0;

    /**
     * The scalar distance between two points (x1,y1) and (x2,y2).
     * See {@link https://en.wikipedia.org/wiki/Euclidean_distance}
     *
     * We might use this to calculate the distance an enemy has to the player.
     *
     * @param {pos1} Point A
     * @param {pos2} Point B
     * @returns Scalar, euclidean distance between two points
     */
    public static euclideanDistance(pos1: Vec2D, pos2: Vec2D): number {
      return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2);
    }

    /**
      * Calculates the angle difference between two angles. Kind of like a
      * pizza slice.
      *
      * @param {from} angle in radians on the left
      * @param {to} angle in radians on the right
      */
    public static signedAngleBetween(from: number, to: number): number {
      return Math.atan2(Math.sin(to - from), Math.cos(to - from));
    }

    /**
     * Check whether a Point (Vector) is within view and get the angle from our viewpoint.
     * 
     * @param origin The viewpoint from which we're looking at the target at, usually the player
     * @param direction Direction in radians (0-2pi) which we're looking in
     * @param target The target which we want to check IF we're looking at
     * @param eyeFov The field of view OF ONE EYE. This represents HALF THE FOV of the screen
     * @returns Boolean === False IF target is not in view ELSE the angle between origin and target
     */
    public static vectorInViewCheck(origin: Vec2D, direction: number, target: Vec2D, eyeFov: number): boolean | number {

        // direction from player to enemy
        let originToTargetVec = origin.getDifference(target)
        let originToTargetAngle = Math.atan2(originToTargetVec.y, originToTargetVec.x);
        // scale [-pi:pi] to [0:2*pi]
        originToTargetAngle += Math.PI


        let absAngleDiff = Math.min(2*Math.PI - Math.abs(originToTargetAngle - direction), Math.abs(originToTargetAngle - direction));

        // Now that we have the angle: The target is in plain view IF it's between the borders of our vision:
        if (absAngleDiff <= eyeFov) {
            return originToTargetAngle;
        } else {
          // The object was beyond our vision:
          return false;
        }
    }
}
