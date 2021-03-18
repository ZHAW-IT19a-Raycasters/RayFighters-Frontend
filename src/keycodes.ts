/**
 * Key codes and their direction.
 * Moving forwards and backwards with W, S
 * Strafing left and right with A, D
 * Turning left and right with Q, E
 * Shooting with CTRL
 */
 enum KeyCodes {
    FORWARD = 87, // W
    BACKWARD = 83, // A
    TURN_LEFT = 81, // Q
    TURN_RIGHT = 69, // E
    STRAFE_LEFT = 65, // S
    STRAFE_RIGHT = 68, // D
    SHOOT = 17, // CTRL
    MOUSE_TURN_LEFT, 
    MOUSE_TURN_RIGHT 
}

export { KeyCodes };
