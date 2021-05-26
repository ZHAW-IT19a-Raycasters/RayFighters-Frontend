import { Image2D } from "../rendering/renderer";
import { Sound, SoundType } from "../sound/sound";


export enum WeaponState {
    IDLE, SHOOTING
}

export class Weapon {
    /**
     * magnification of weapon images on the screen
     */ 
    public static readonly WEAPON_ZOOM = 0.5;

    /**
      * A factor used in the renderer to animate the weapon swaying (bobbing)
      * from left to right. This effectively sets the "radius", kind of like a
      * stride length.
      */ 
    public static readonly WEAPON_BOB_SWAY = 20;

    /**
      * How fast the weapon bobs. A faster factor here may be used to animate faster walking speeds
      */
    public static readonly WEAPON_BOB_SPEED = 3;


    /**
     * Also corresponds with shoot frequency. Determines after which timespan a
     * shot can be fired.
     */
    private static readonly DEFAULT_SHOOT_DURATION = 0.4; // seconds

    /**
     * Color of the muzzle flash that's going to be rendered on the floor near
     * color gradient.
     */
    public static readonly DEFAULT_MUZZLE_FLASH_COLOR = '#baba82';

    /**
     * Determines if the weapon is semi-automatic. If false, it's automatic.
     * The idea when a weapon is semi-automatic is that you have to click for
     * each shot (as opposed to an automatic weapon where you can just hold
     * down the button and keep shooting).
     */
    private semiAutomatic: boolean;

    /**
     * Determines how long the shooting animation lasts in seconds.
     */
    private shootDuration: number;

    /**
     * Image shown when the gun's not being shot (idle)
     */
    private idleImage: Image2D;

    /**
     * Image set used to animate when the gun is shot
     */
    private shootImages: Image2D[];

    /**
     * Index for this.shootImages
     */
    private currentShootImage: number;

    /**
     * In which state the weapon animation is
     */
    private weaponState: WeaponState;

    /**
     * Time elapsed since the last shooting animation image in seconds.
     * Used as an animation timekeeping variable. So if a certain time has
     * passed (this.shootAnimDuration), then we swap to the next weapon
     * animation image.
     */
    private timeSinceLastShootImg: number;

    /**
     * How long one weapon animation frame lasts in seconds.
     * It's a fraction of this.shootDuration
     */
    private shootAnimDuration: number;

    /**
     * Is the muzzle flash currently going on?
     * If yes, the renderer will render a bright flash.
     */
    private muzzleFlashOngoing: boolean;

    /**
     * Color (#RRGGBB) of the gunshot flash color
     */
    private muzzleFlashColor: string;

    /**
     * 
     * @param imgPath Path to the idle weapon image
     * @param shootImgPaths Array of paths to the weapon images for the shooting animations (can be of any length > 0)
     * @param width Width in px of the weapon images
     * @param height Height in px of the weapon images
     * @param semiAutomatic Is non automatic eg. pistol, revolver, etc
     * @param shootDuration How long a shot lasts in second
     * @param muzzFlashCol Color of the muzzle flash (#RRGGBB)
     * @param testingImage2DClass Mocking class of Image2D for testing purposes
     */
    constructor(
        private imgPath: string, 
        shootImgPaths: string[], 
        width: number, 
        height: number, 
        semiAutomatic: boolean, 
        shootDuration?: number,
        muzzFlashCol?: string, 
        testingImage2DClass?: any, 
        ) {

        this.idleImage = testingImage2DClass ? new testingImage2DClass(imgPath, width, height) : new Image2D(imgPath, width, height);
        this.weaponState = WeaponState.IDLE;
        this.shootImages = new Array<Image2D>(shootImgPaths.length);
        for (let i = 0; i < shootImgPaths.length; i++) {
            this.shootImages[i] = testingImage2DClass ? new testingImage2DClass(shootImgPaths[i], width, height) : new Image2D(shootImgPaths[i], width, height);
        }
        // How long one shoot animation sprite's displayed for.
        // Example for 1s with 2 images: would mean that each image gets 0.5s of time.
        this.currentShootImage = 0;
        this.timeSinceLastShootImg = 0;
        this.muzzleFlashOngoing = false;
        if(muzzFlashCol) {
            this.muzzleFlashColor = muzzFlashCol;
        } else {
            this.muzzleFlashColor = Weapon.DEFAULT_MUZZLE_FLASH_COLOR;
        }

        this.semiAutomatic = semiAutomatic;

        // Setup shoot duration (weapon timeout)
        if(shootDuration){
            this.shootDuration = shootDuration;
        } else {
            this.shootDuration = Weapon.DEFAULT_SHOOT_DURATION;
        }
        this.shootAnimDuration = this.shootDuration / this.shootImages.length;

    }

    public get getMuzzleFlashColor(): string {
        return this.muzzleFlashColor;
    }

    public get getCurrentImage2D() {
        if(this.weaponState == WeaponState.SHOOTING) {
            return this.shootImages[this.currentShootImage];
        }
        return this.idleImage;
    }

    public get isMuzzleFlashOngoing(): boolean {
        return this.muzzleFlashOngoing;
    }

    /**
     * - Set weapon state to SHOOT if not already shooting
     * - Play shooting sound
     * - Enable muzzle flash
     */
    public shoot(): void {
        if(this.weaponState == WeaponState.IDLE){
            Sound.get.play(SoundType.SHOOT, 0.5);
            this.weaponState = WeaponState.SHOOTING;
            this.muzzleFlashOngoing = true;
        }
    }

    /**
     * Timekeeping method to cycle the weapon shoot animation and set muzzle
     * flash status.
     * @param time Time passed in seconds (probably taken from the gameloop)
     */
    public update(time: number): void {
        if(this.weaponState == WeaponState.SHOOTING) {
            this.timeSinceLastShootImg += time;
            if(this.timeSinceLastShootImg >= this.shootAnimDuration) {
                if(this.currentShootImage == (this.shootImages.length - 1)) {
                    this.weaponState = WeaponState.IDLE;
                    this.currentShootImage = 0;
                } else {
                    ++this.currentShootImage;
                    this.muzzleFlashOngoing = false;
                }
                this.timeSinceLastShootImg = 0;
            }
        }
    }

    public get getWeaponState() : WeaponState {
        return this.weaponState
    }

    public get isSemiautomatic(): boolean {
        return this.semiAutomatic;
    }
}
