import { Image2D } from "./renderer";

enum WeaponState {
    IDLE, SHOOTING
}

export class Weapon {
    private static readonly WEAPON_ZOOM = 2.5; // magnification of weapon images
    private static readonly SHOOT_ANIM_DURATION = 0.2; // seconds

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
    private timeSinceTriggered: number;

    private shootAnimDuration: number;

    constructor(private imgPath: string, shootImgPaths: string[], width: number, height: number) {
        width *= Weapon.WEAPON_ZOOM;
        height *= Weapon.WEAPON_ZOOM;
        this.idleImage = new Image2D(imgPath, width, height);
        this.weaponState = WeaponState.IDLE;
        this.shootImages = new Array<Image2D>(shootImgPaths.length);
        for (let i = 0; i < shootImgPaths.length; i++) {
            this.shootImages[i] = new Image2D(shootImgPaths[i], width, height);
        }
        // How long one shoot animation sprite's displayed for.
        // Example for 1s with 2 images: would mean that each image gets 0.5s of time.
        this.shootAnimDuration = Weapon.SHOOT_ANIM_DURATION / this.shootImages.length;
        this.currentShootImage = 0;
        this.timeSinceTriggered = 0;
    }

    public get getCurrentImage2D() {
        if(this.weaponState == WeaponState.SHOOTING) {
            return this.shootImages[this.currentShootImage];
        }
        return this.idleImage;
    }

    public shoot(): void {
        if(this.weaponState == WeaponState.IDLE){
            this.weaponState = WeaponState.SHOOTING;
        }
    }

    public update(time: number): void {
        if(this.weaponState == WeaponState.SHOOTING) {
            this.timeSinceTriggered += time;
            if(this.timeSinceTriggered >= this.shootAnimDuration) {
                if(this.currentShootImage == (this.shootImages.length - 1)) {
                    this.weaponState = WeaponState.IDLE;
                    this.currentShootImage = 0;
                } else {
                    ++this.currentShootImage;
                }
                this.timeSinceTriggered = 0;
            }
        }
    }
}