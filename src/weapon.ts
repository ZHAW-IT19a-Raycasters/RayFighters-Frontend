import { Image2D } from "./renderer";

export class Weapon {
    private image: Image2D;

    constructor(private imgPath: string, width: number, height: number) {
        this.image = new Image2D(imgPath, width, height);
    }

    public get getImage2D() {
        return this.image;
    }

    // TODO:
    // 1. Bobbing 
    // 2. Spritesheet animations
}