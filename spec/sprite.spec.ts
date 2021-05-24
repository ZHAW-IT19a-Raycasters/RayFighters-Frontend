import { EntityType } from "../src/entities/entity";
import { Sprite } from "../src/entities/sprite"
import { Image2D } from "../src/rendering/renderer"

const testSpritePath = 'nothing.jpg';
const testSprites = new Array<Image2D>(new Image2D(testSpritePath, 1, 1));

describe('Sprite unit test', () => {
    it('should instantiate sprite objects correctly', () => {
        const testSprite = new Sprite(testSprites, EntityType.DECORATION);
        expect(testSprite.getAngle).toBe(0);
        expect(testSprite.getPosition.x).toBe(1);
        expect(testSprite.getPosition.y).toBe(1);
        expect(testSprite.getSprite()).toBe(testSprites[0]);
    })
})