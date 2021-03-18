import { KeyCodes } from "../src/keycodes";

/**
 * Control class, handling all user inputs, both touch and via keyboard.
 * To read user input, poll the 'states' map to see if any key is pressed currently.
 */
class Controls {
    /** 
     * Margin (minus and plus from center of screen) in the middle of the screen, where no turning should happen while using mouse looking.
     */
    private SCREEN_DIVIDE_VERTICAL: number = 0.2

    public states = new Map([
        [KeyCodes.FORWARD, false],
        [KeyCodes.BACKWARD, false],
        [KeyCodes.TURN_LEFT, false],
        [KeyCodes.TURN_RIGHT, false],
        [KeyCodes.STRAFE_LEFT, false],
        [KeyCodes.STRAFE_RIGHT, false],
        [KeyCodes.SHOOT, false]
    ]);

    /**
     * Constructor of control class. Registers all event handlers.
     */
    constructor() {
        document.addEventListener('keydown', this.keyHandler.bind(this, true), false);
        document.addEventListener('keyup', this.keyHandler.bind(this, false), false);
        document.addEventListener('touchstart', this.touchHandler.bind(this), false);
        document.addEventListener('touchmove', this.touchHandler.bind(this), false);
        document.addEventListener('touchend', this.touchReleaseHandler.bind(this), false);
        document.addEventListener('mousemove', this.mouseMoveHandler.bind(this), false);
        document.addEventListener('onclick', this.mouseClickHandler.bind(this), false);

        // Locking of mouse cursor, enabling of continuous vertical movement
        document.body.onclick =
            document.body.requestPointerLock //||
            //document.body.mozRequestPointerLock || // TODO: Throws error
            //document.body.webkitRequestPointerLock;
    }

    /**
     * Clears all currently active keys.
     */
    public clearInputs() {
        for (let key of Array.from(this.states)) {
            this.states.set(key[0], false)
        }
    }

    /**
     * Handles key presses.
     * @param value Key code that was pressed.
     * @param event Event that gets passed from the listener. 
     * @returns 
     */
    private keyHandler(value: boolean, event: any): void {
        var state = this.states.get(event.keyCode);

        if (typeof state === 'undefined') {
            return;
        }

        this.states.set(event.keyCode, value);
        event.stopPropagation && event.stopPropagation();
        event.preventDefault && event.preventDefault();
    }

    /**
     * Handles touch input. Gets called as soon as the screen is tapped.
     * @param event Event that gets passed from the listener. 
     */
    private touchHandler(event: any): void {
        var touch = event.touches[0];
        this.touchReleaseHandler(event);

        // TODO poll on-screen shoot button that is used exclusively on mobile and do early return to skip movement handling

        if (touch.pageY < window.innerHeight * 0.5) {
            this.keyHandler(true, { keyCode: KeyCodes.FORWARD });
        }
        else if (touch.pageX < window.innerWidth * 0.5) {
            this.keyHandler(true, { keyCode: KeyCodes.TURN_LEFT });
        }
        else if (touch.pageY > window.innerWidth * 0.5) {
            this.keyHandler(true, { keyCode: KeyCodes.TURN_RIGHT });
        }
    }

    /**
     * Handles the end of touch input. Gets called as soon as the screen tap is released.
     * @param event Event that gets passed from the listener. 
     */
    private touchReleaseHandler(event: any): void {
        this.clearInputs();
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handles mouse look.
     * @param event Event that gets passed from the listener. 
     */
    private mouseMoveHandler(event: any) {
        var mousePositionX = (event.movementX || event.mozMovementX || event.webkitMovementX || 0);

        // No turning (mouse in middle of screen)
        if (mousePositionX < this.SCREEN_DIVIDE_VERTICAL && mousePositionX > -this.SCREEN_DIVIDE_VERTICAL) {
            this.keyHandler(false, { keyCode: KeyCodes.TURN_LEFT });
            this.keyHandler(false, { keyCode: KeyCodes.TURN_RIGHT });
            return;
        }

        // Right turn
        if (mousePositionX > this.SCREEN_DIVIDE_VERTICAL) {
            this.keyHandler(true, { keyCode: KeyCodes.TURN_RIGHT });
        }

        // Left turn
        if (mousePositionX < -this.SCREEN_DIVIDE_VERTICAL) {
            this.keyHandler(true, { keyCode: KeyCodes.TURN_LEFT });
        }
    }

    /**
     * Handles mouse clicks.
     * @param event Event that gets passed from the listener. 
     */
    private mouseClickHandler(event: any) {
        this.states.set(KeyCodes.SHOOT, true); // Bang!
    }
}

export { Controls };
