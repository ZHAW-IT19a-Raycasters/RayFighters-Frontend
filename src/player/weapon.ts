import { Image2D } from "../rendering/renderer";
import { Sound, SoundType } from "../sound/sound";


export enum WeaponState {
    IDLE, SHOOTING
}

export class Weapon {
    public static WEAPON_ZOOM = 0.5; // magnification of weapon images

    /**
     * Also corresponds with shoot frequency. Determines after which timespan a shot can be fired.
     */
    private static readonly DEFAULT_SHOOT_DURATION = 0.4; // seconds
    private static readonly MUZZLE_FLASH_DURATION = 0.1; // seconds
    public static readonly DEFAULT_MUZZLE_FLASH_COLOR = '#baba82';

    /**
     * Determines if the weapon is semi-automatic. If false, it's automatic.
     */
    private semiAutomatic: boolean;

    /**
     * Determines how long the shooting animation lasts.
     */
    private shootDuration: number;

    /**
     * Image shown when the gun's not being shot
     */
    private idleImage: Image2D;
    /**
     * Image set used to animate when the gun is shot
     */
    private shootImages: Image2D[];
    private currentShootImage: number;

    private weaponState: WeaponState;
    private timeSinceLastShootImg: number;

    private shootAnimDuration: number;

    private muzzleFlashOngoing: boolean;

    private muzzleFlashColor: string;

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

    public shoot(): void {
        if(this.weaponState == WeaponState.IDLE){
            Sound.get.play(SoundType.SHOOT, 0.5);
            this.weaponState = WeaponState.SHOOTING;
            this.muzzleFlashOngoing = true;
        }
    }

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