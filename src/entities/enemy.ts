import { Image2D } from "../rendering/renderer";
import { MathHelper } from "../common/mathhelper";
import { PlayerInfo } from "../communication/playerinfo";
import { Entity, EntityType } from "./entity";
import { Sound, SoundType } from "../sound/sound";
import { Vec2D } from "../common/vec2d";

/**
 * State of walking / shooting animation.
 */
enum EnemySpriteState {
    IDLE, WALK_1, WALK_2, SHOOTING
}

/**
 * Direction the player can face.
 */
enum EnemySpriteDirection {
    NORTH = 1,
    EAST = 2,
    SOUTH = 3,
    WEST = 0,
}

/**
 * Dedicated enemy class for other players. Provides all methods the game uses to display competitors on the playfield.
 */
export class Enemy extends Entity {
    /**
     * Height of enemy sprite.
     */
    private static readonly ENEMY_HEIGHT = 2048;

    /**
     * Width of enemy sprite.
     */
    private static readonly ENEMY_WIDTH = 1024;

    /**
     * Scaling of enemy sprite (relative to the walls)
     */
    private static readonly ENEMY_SCALING = 0.4;

    /**
     * Time in [seconds] how long the walking animation interval lasts.
     */
    public static readonly WALK_INTERVAL = 0.2; // [seconds]

    /**
     * Determines by which divisor the step sound volume is calculated.
     */
    public static readonly STEP_SOUND_DIVIDER = 2;

    /**
     * Time in [seconds] how long the walking animation cooldown lasts.
     */
    private static readonly WALK_COOLDOWN = 0.5; // [seconds]

    /**
     * Fixed array that defines the order of the walking animation.
     */
    private static readonly WALKING_CYCLE = new Array<EnemySpriteState>(EnemySpriteState.IDLE, EnemySpriteState.WALK_1, EnemySpriteState.IDLE, EnemySpriteState.WALK_2);

    
    /**
     * All player informaton of the enemy. See {@link PlayerInfo}
     */
    private playerInfo: PlayerInfo;

    /**
     * Array of idling sprites of the enemy. (Front / Back / Left / Right)
     */
    private idleSprites: Array<Image2D>;

    /**
     * Array of left stepping walking sprites of the enemy. (Front / Back / Left / Right)
     */
    private walkSprites1: Array<Image2D>;

    /**
     * Array of right stepping walking sprites of the enemy. (Front / Back / Left / Right)
     */
    private walkSprites2: Array<Image2D>;

    /**
     * Array of shooting sprites of the enemy. (Front / Back / Left / Right)
     */
    private shootingSprites: Array<Image2D>;

    /**
     * Map collection of all sprites of the enemy. Makes organizing and loading the correct sprite for the situation easier.
     */
    private spriteMap: Map<EnemySpriteState, Array<Image2D>>;

    /**
     * Current walking state of the enemy. See {@link EnemySpriteState}
     */
    private spriteState: EnemySpriteState;

    /**
     * Counter of the walking animation. Needed for walking animation. Needed for counting until the next animation is triggered.
     */
    private walkAnimationCounter: number;

    /**
     * Time that has passed since the player started walking. Needed for walking animation.
     */
    private timeElapsedSinceStartedWalking: number;

    /**
     * Time that passes between walking animation intervals. Needed for walking animation.
     */
    private timeSinceWalkInterval: number;

    /**
     * Time that passes between shooting animation intervals. Needed for shooting animation.
     */
    private timeSinceShotInterval: number;

    /**
     * Determines if the enemy has shot recently.
     */
    private hasShot: boolean;
    
    /**
     * Determines if the enemy is currently walking.
     */
    private isWalking: boolean;

    /**
     * The distance from the player.
     */
    private distanceToPlayer: number;

    
    /**
     * Constructor of the enemy class. Instantiates an {@link Entity} instance and prerepares all sprite arrays and adds it to the {@link spriteMap}.
     */
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

        // Fill up the sprite map with above arrays.
        this.spriteMap = new Map<EnemySpriteState, Array<Image2D>>();
        this.spriteMap.set(EnemySpriteState.IDLE, this.idleSprites);
        this.spriteMap.set(EnemySpriteState.WALK_1, this.walkSprites1);
        this.spriteMap.set(EnemySpriteState.WALK_2, this.walkSprites2);
        this.spriteMap.set(EnemySpriteState.SHOOTING, this.shootingSprites);

        // Initialization of all variables.
        this.walkAnimationCounter = 0;
        this.spriteState = EnemySpriteState.IDLE;
        this.timeElapsedSinceStartedWalking = 0;
        this.timeSinceWalkInterval = 0;
        this.hasShot = false;
        this.timeSinceShotInterval = 0;
        this.isWalking = false;
    }

    /**
     * Returns the correct sprite depending on the viewing angle of the player.
     * @returns an {@link Image2D} instance with the correct image.
     */
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

    /**
     * Cycle between different walking cycle states.
     */
    public cycleSpriteState(): void {
        ++this.walkAnimationCounter;
        if (this.walkAnimationCounter % Enemy.STEP_SOUND_DIVIDER === 0) {
            Sound.get.play(SoundType.STEP, Sound.get.distanceToVolume(this.distanceToPlayer));
        }
        this.spriteState = Enemy.WALKING_CYCLE[this.walkAnimationCounter % Enemy.WALKING_CYCLE.length];
    }

    /**
     * Triggers shooting animation.
     */
    public shoot(playerPosition: Vec2D): void {
        this.hasShot = true;
        Sound.get.play(SoundType.SHOOT, Sound.get.distanceToVolume(this.distanceToPlayer));
    }

    /**
     * Triggers walking animation.
     */
    public walk(): void {
        this.isWalking = true;
    }

    /**
     * Updates distance to {@link Player}.
     * @param playerPosition {@link Vec2D} position of {@link Player}.
     */
    public updateDistanceToPlayer(playerPosition: Vec2D) {
        this.distanceToPlayer = MathHelper.euclideanDistance(playerPosition, this.position);
    }

    /**
     * Update method for walking animation.
     * @param time how much time has passed. [seconds]
     */
    public update(time: number): void {
        if (this.hasShot) {
            this.timeSinceShotInterval += time;
            if (this.timeSinceShotInterval > Enemy.WALK_INTERVAL) {
                this.hasShot = false;
                this.timeSinceShotInterval = 0;
            } else {
                this.spriteState = EnemySpriteState.SHOOTING;
            }
            return;
        }

        if (this.isWalking) {
            this.timeElapsedSinceStartedWalking += time;
            this.timeSinceWalkInterval += time;
            if (this.timeElapsedSinceStartedWalking > Enemy.WALK_COOLDOWN) {
                this.isWalking = false;
                this.spriteState = EnemySpriteState.IDLE;
                this.timeElapsedSinceStartedWalking = 0;
            } else {
                if (this.timeSinceWalkInterval > Enemy.WALK_INTERVAL) {
                    this.timeSinceWalkInterval = 0;
                    this.cycleSpriteState();
                }
            }
        }
    }
}
