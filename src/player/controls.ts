/**
 * Key codes and their direction.
 * 
 * Moving forwards and backwards with W, S
 * Strafing left and right with A, D
 * Turning left and right with Q, E and mouse left/right
 * Shooting with Space bar
 * See scoreboard with Tab
 */
export enum KeyCodes {
    FORWARD = 87,       // W
    BACKWARD = 83,      // S
    TURN_LEFT = 81,     // Q
    TURN_RIGHT = 69,    // E
    STRAFE_LEFT = 65,   // A
    STRAFE_RIGHT = 68,  // D
    SHOOT = 32,         // SPACE
    MOUSE_TURN_LEFT,
    MOUSE_TURN_RIGHT,
    SCOREBOARD = 9,     // TAB
    SETTINGS = 78,      // N
    FPS = 70            // F
}


/**
 * Control class, handling all user inputs, both touch and via keyboard, as well as handling mouse movement.
 */
export class Controls {

    /**
     * States map. Records which key or action is activated at any given moment. Can be polled and updated.
     * Clearing all values, ergo changing all values to false can be done using the clearInputs() method.
     */
    public states = new Map([
        [KeyCodes.FORWARD, false],
        [KeyCodes.BACKWARD, false],
        [KeyCodes.TURN_LEFT, false],
        [KeyCodes.TURN_RIGHT, false],
        [KeyCodes.STRAFE_LEFT, false],
        [KeyCodes.STRAFE_RIGHT, false],
        [KeyCodes.SHOOT, false],
        [KeyCodes.MOUSE_TURN_LEFT, false],
        [KeyCodes.MOUSE_TURN_RIGHT, false],
        [KeyCodes.SCOREBOARD, false],
        [KeyCodes.SETTINGS, false],
        [KeyCodes.FPS, false]
    ]);

    /**
     * Multiplier for mouse look sensitivity
     */
    public static readonly MOUSE_LOOK_SENSITIVITY = 20;

    /**
     * Multiplier for touch look sensitivity
     */
    public static readonly TOUCH_LOOK_SENSITIVITY = 0.75;

    /**
     * Shoot button on the html page.
     */
    private shootButton: any = document.getElementById('shootbutton');

    /**
     * Vessel for location and dimensions of the shoot button on the html page.
     */
    private shootButtonRect: any;

    /**
     * How many pixels the mouse has moved since it's last moved
     */
    private lastMouseDeltaX: number;

    /**
     * Are we currently on a mobile device? => Touch Controls!
     */
    private isMobileDevice: boolean;

    /**
     * Constructor of control class. Registers all event handlers.
     * @param navigatorMock Mocked navigator object used for testing.
     */
    constructor(navigatorMock?: any) {
        document.addEventListener('keydown',        (event) => this.keyHandler(true, event), false);
        document.addEventListener('keyup',          (event) => this.keyHandler(false, event), false);
        document.addEventListener('touchstart',     (event) => this.touchHandler(event), false);
        document.addEventListener('touchmove',      (event) => this.touchHandler(event), false);
        document.addEventListener('touchend',       (event) => this.touchReleaseHandler(event), false);
        document.addEventListener('mousemove',      (event) => this.mouseMoveHandler(event), false);
        document.addEventListener('mousedown',      (event) => this.mouseDownHandler(event), false);
        document.addEventListener('mouseup',        (event) => this.mouseUpHandler(event), false);
        document.body.onclick = document.body.requestPointerLock

        // Early return if the navigator was mocked.
        if (navigatorMock) {
            this.isMobileDevice = false;
            return;
        }

        // Detect mobile devices with user agent check
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.isMobileDevice = true;
        } else {
            this.isMobileDevice = false;
        }
        console.log(`Controls: Detected ${this.isMobileDevice ? 'MOBILE' : 'DESKTOP'} inputs.`);
    }

    /**
     * Clears all currently active keys.
     */
    public clearInputs(): void {
        for (let key of Array.from(this.states)) {
            this.states.set(key[0], false)
        }
    }

    public getMouseDelta(): number {
        return this.lastMouseDeltaX;
    }

    public get isMobile(): boolean {
        return this.isMobileDevice;
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

        if (event.touches.length <= 3) {

            for (var i = 0; i < event.touches.length; i++) {
                
                var touch = event.touches[i];

                this.shootButtonRect = this.shootButton.getBoundingClientRect() // Update position of shoot button in case the device was rotated
        
                if (touch.pageY >= this.shootButtonRect.y && touch.pageY <= this.shootButtonRect.y + this.shootButtonRect.height &&
                    touch.pageX >= this.shootButtonRect.x && touch.pageX <= this.shootButtonRect.x + this.shootButtonRect.width) {
                    this.keyHandler(true, { keyCode: KeyCodes.SHOOT });
                    return;
                }
        
                if (touch.pageY < window.innerHeight * 0.5) {
                    this.keyHandler(true, { keyCode: KeyCodes.FORWARD });
                }
        
                else if (touch.pageX < window.innerWidth * 0.3) {
                    this.keyHandler(true, { keyCode: KeyCodes.TURN_LEFT });
                }
        
                else if (touch.pageX > window.innerWidth * 0.7) {
                    this.keyHandler(true, { keyCode: KeyCodes.TURN_RIGHT });
                }
        
                else if (touch.pageY > window.innerHeight * 0.5) {
                    this.keyHandler(true, { keyCode: KeyCodes.BACKWARD });
                }
            }
        }
    }

    /**
     * Handles the end of touch input. Gets called as soon as the screen tap is released.
     * @param event Event that gets passed from the listener. 
     */
    private touchReleaseHandler(event: any): void {
        this.clearInputs();
        // event.preventDefault(); // TODO Throws error on console - Only test with a real mobile can tell if this line can be removed
        event.stopPropagation();
    }

    /**
     * Handles mouse look.
     * @param event Event that gets passed from the listener. 
     */
    private mouseMoveHandler(event: any): void {
        var mousePositionX = (event.movementX || event.mozMovementX || event.webkitMovementX || 0);
        // Right turn
        if (mousePositionX > 0) {
            this.keyHandler(true, { keyCode: KeyCodes.MOUSE_TURN_RIGHT });
            this.states.set(KeyCodes.MOUSE_TURN_LEFT, false)
            this.lastMouseDeltaX = mousePositionX;
        }

        // Left turn
        if (mousePositionX < 0) {
            this.keyHandler(true, { keyCode: KeyCodes.MOUSE_TURN_LEFT });
            this.states.set(KeyCodes.MOUSE_TURN_RIGHT, false)
            this.lastMouseDeltaX = mousePositionX;
        }
    }

    /**
     * Handles mouse clicks in case the mouse button gets pressed down.
     * @param event Event that gets passed from the listener. 
     */
    private mouseDownHandler(event: any): void {
        this.keyHandler(true, { keyCode: KeyCodes.SHOOT });
    }

    /**
     * Handles mouse clicks in case the mouse button gets released.
     * @param event Event that gets passed from the listener. 
     */
    private mouseUpHandler(event: any): void {
        this.keyHandler(false, { keyCode: KeyCodes.SHOOT });
    }
}

