import { Image2D } from "../rendering/renderer";
import { MathHelper } from "../common/mathhelper";
import { PlayerInfo } from "../communication/playerinfo";
import { Entity, EntityType } from "./entity";

enum EnemySpriteState {
    IDLE, WALK_1, WALK_2, SHOOTING
}

enum EnemySpriteDirection {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3,
}

export class Enemy extends Entity {
    private playerInfo: PlayerInfo;
    private idleSprites: Array<Image2D>;
    private walkSprites1: Array<Image2D>;
    private walkSprites2: Array<Image2D>;
    private shootingSprites: Array<Image2D>;
    private spriteMap: Map<EnemySpriteState, Array<Image2D>>;
    private spriteState: EnemySpriteState;
    private walkAnimationCounter: number;

    private static readonly ENEMY_HEIGHT = 2048;
    private static readonly ENEMY_WIDTH = 1024;
    private static readonly ENEMY_SCALING = 0.4;
    private static readonly WALKING_CYCLE = new Array<EnemySpriteState>(EnemySpriteState.IDLE, EnemySpriteState.WALK_1, EnemySpriteState.IDLE, EnemySpriteState.WALK_2);


    constructor() {
        super(EntityType.ENEMY);

        this.idleSprites = new Array<Image2D>(  
            new Image2D('assets/enemies/female/front_0.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_r_0.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/back_0.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_l_0.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT)
        );

        this.walkSprites1 = new Array<Image2D>(
            new Image2D('assets/enemies/female/front_1.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_r_1.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/back_1.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_l_1.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT)
        );

        this.walkSprites2 = new Array<Image2D>(
            new Image2D('assets/enemies/female/front_2.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_r_2.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/back_2.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_l_2.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT)
        );

        this.shootingSprites = new Array<Image2D>(
            new Image2D('assets/enemies/female/front_shoot.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_r_shoot.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/back_shoot.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT),
            new Image2D('assets/enemies/female/side_l_shoot.png', Enemy.ENEMY_SCALING * Enemy.ENEMY_WIDTH, Enemy.ENEMY_SCALING * Enemy.ENEMY_HEIGHT)
        );

        this.spriteMap = new Map<EnemySpriteState, Array<Image2D>>();
        this.spriteMap.set(EnemySpriteState.IDLE, this.idleSprites);
        this.spriteMap.set(EnemySpriteState.WALK_1, this.walkSprites1);
        this.spriteMap.set(EnemySpriteState.WALK_2, this.walkSprites2);
        this.spriteMap.set(EnemySpriteState.SHOOTING, this.shootingSprites);

        this.walkAnimationCounter = 0;

        this.spriteState = EnemySpriteState.IDLE;
    }

    public getSprite(): Image2D {
        const lookDirection = Math.abs(this.angle - this.lastPlayerViewingAngle);

        // Check east
        if ((lookDirection > MathHelper.NORTH + MathHelper.EIGHTH_OF_CIRCLE && lookDirection < MathHelper.CIRCLE) ||
         (lookDirection <= MathHelper.SOUTH - MathHelper.EIGHTH_OF_CIRCLE && lookDirection >= MathHelper.EAST)) {
            return this.spriteMap.get(this.spriteState)[EnemySpriteDirection.EAST];
        }

        // Check south
        if (lookDirection > MathHelper.SOUTH - MathHelper.EIGHTH_OF_CIRCLE && lookDirection <= MathHelper.WEST - MathHelper.EIGHTH_OF_CIRCLE) {
            return this.spriteMap.get(this.spriteState)[EnemySpriteDirection.SOUTH];
        }

        // Check west
        if (lookDirection > MathHelper.SOUTH + MathHelper.EIGHTH_OF_CIRCLE && lookDirection <= MathHelper.NORTH - MathHelper.EIGHTH_OF_CIRCLE) {
            return this.spriteMap.get(this.spriteState)[EnemySpriteDirection.WEST];
        }

        // Default: North
        return this.spriteMap.get(this.spriteState)[EnemySpriteDirection.NORTH];
    }

    public get getPlayerInfo(): PlayerInfo {
        return this.playerInfo
    }

    public set setPlayerInfo(playerInfo: PlayerInfo) {
        this.playerInfo = playerInfo;
    }

    public cycleSpriteState(): void{
        ++this.walkAnimationCounter;
        this.spriteState = Enemy.WALKING_CYCLE[this.walkAnimationCounter % Enemy.WALKING_CYCLE.length];
    }

    public showShootAnimation(): void {
        this.spriteState = EnemySpriteState.SHOOTING;
    }
}
