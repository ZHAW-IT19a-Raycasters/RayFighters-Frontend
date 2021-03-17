/**
 * Control class, handling all user inputs, both touch and via keyboard.
 * To read user input, poll the 'states' map to see if any key is pressed currently.
 */
 class Controls {
    public states = new Map([
        [KeyCodes.FORWARD, false],
        [KeyCodes.BACKWARD, false],
        [KeyCodes.TURN_LEFT, false],
        [KeyCodes.TURN_RIGHT, false],
        [KeyCodes.STRAFE_LEFT, false],
        [KeyCodes.STRAFE_RIGHT, false],
        [KeyCodes.SHOOT, false]
    ]);

    constructor() {
        document.addEventListener('keydown', this.onKey.bind(this, true), false);
        document.addEventListener('keyup', this.onKey.bind(this, false), false);
        document.addEventListener('touchstart', this.onTouch.bind(this), false);
        document.addEventListener('touchmove', this.onTouch.bind(this), false);
        document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    }

    private onKey(val: any, event: any): void {
        var state = this.states.get(event.keyCode);
        if (typeof state === 'undefined') {
            return;
        }
        this.states.set(event.keyCode, val);
        event.stopPropagation && event.stopPropagation();
        event.preventDefault && event.preventDefault();
    }

    private onTouch(event: any): void {
        var touch = event.touches[0];
        this.onTouchEnd(event);
        if (touch.pageY < window.innerHeight * 0.5) this.onKey(true, { keyCode: KeyCodes.FORWARD });
        else if (touch.pageX < window.innerWidth * 0.5) this.onKey(true, { keyCode: KeyCodes.TURN_LEFT });
        else if (touch.pageY > window.innerWidth * 0.5) this.onKey(true, { keyCode: KeyCodes.TURN_RIGHT });
    }

    private onTouchEnd(event: any): void {
        for (let key of Array.from(this.states)) {
            this.states.set(key[0], false)
        }
        event.preventDefault();
        event.stopPropagation();
    }
}

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
    SHOOT = 17 // CTRL
}

export { Controls };