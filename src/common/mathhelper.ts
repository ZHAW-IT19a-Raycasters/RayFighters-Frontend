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
     * Pre-Calculated NWSE directions in radiants.
     */
     public static readonly NORTH = (3 / 2) * Math.PI;
     public static readonly WEST = Math.PI;
     public static readonly SOUTH = Math.PI / 2;
     public static readonly EAST = 0;

    /**
     * 
     * @param pos1 Point A
     * @param pos2 Point B
     * @returns Scalar, euclidean distance between two points
     */
    public static euclideanDistance(pos1: Vec2D, pos2: Vec2D): number {
      return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2);
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
        // First, we move the target down by the difference of the target,
        // because we want to work based off of the origin (0,0).
        const zeroedTargetPosition = target.getDifference(origin);
        // The distance to target is now 1, we've normalized the problem into a unit circle:
        const normalizedTargetPosition = zeroedTargetPosition.getNormalized;
        // Leftmost angle border we still see
        const leftAngle = direction - eyeFov;
        // Rightmost angle border we still see
        const rightAngle = direction + eyeFov;

        // Angle between the origin (0, 0) and our target (look up unit circle with atan2 for help):
        let angle = Math.atan2(normalizedTargetPosition.y, normalizedTargetPosition.x);

        // Extend the angle to 0-2pi (or 0-360°), we don't want to work with atans -pi to pi:
        if (normalizedTargetPosition.y < 0) {
            angle += MathHelper.CIRCLE;
        }

        // Now that we have the angle: The target is in plain view IF it's between the borders of our vision:
        //document.getElementById('debug-window').innerText = `debug: ${(angle) * (180/Math.PI)}`;
        if (angle >= leftAngle && angle <= rightAngle) {
            return angle;
        } else {
          //document.getElementById('debug-window').innerText += ' NOT IN VIEW ';
        }
        // The object was beyond our vision:
        return false;
    }
}
