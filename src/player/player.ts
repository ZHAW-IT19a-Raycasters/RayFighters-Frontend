import { Map2D, MapElementType } from "../maps/map2d";
import { KeyCodes, Controls } from "./controls";
import { Vec2D } from "../common/vec2d";
import { MathHelper } from "../common/mathhelper";
import { Weapon, WeaponState } from "./weapon";
import { PacketFactory } from "../communication/packetfactory";
import { PlayerInfo } from "../communication/playerinfo";
import { Sound, SoundType } from "../sound/sound";
import { Enemy } from "../entities/enemy";
import { GameHUD } from "../ui/gameHud";


/**
 * Player class, handling all the Player actions.
 */
export class Player {
  /**
   * How fast we're moving
   */
  public static readonly DEFAULT_WALK_SPEED = 2;

  /**
   * Maximum player life
   */
  public static readonly MAX_HEALTH = 150;

  /**
   * Volume of audio clip of when we're shot dead
   */
  private static readonly DEATH_SOUND_VOLUME = 0.5;

  private static readonly DEFAULT_SCREEN_WIDTH = 1920;

  /**
   * Further meta informations about ourselves in the network context (what's
   * our player name and id). Note that enemies have this information aswell.
   */
  private playerInfo: PlayerInfo;

  private health: number;

  /**
   * Where we are on a 2d plane
   */
  private position: Vec2D;

  /**
   * How far we've moved. This is used for the weapon bobbing animation.
   */
  private paces: number;

  /**
   * Tied to this.paces. Used to determine whether we've moved.
   */
  private lastPaces: number;

  /**
   * Timer for walking sounds.
   */
  private walkTimer: number;

  private gameHUD: GameHUD;

  /**
   * Used for determining screen width in mouselook code
   */
  private screenWidth: number;
  
  /***
   * @constructor
   * @param x Player postition on the x-axis
   * @param y Player postition on the y-axis
   * @param angle Starting angle/direction in radians
   * @param weapon What weapon we're holding
   * @param walkSpeed Rate at which we're moving
   */
  constructor(x: number, y: number, private angle: number, gameHUD: any, private weapon?: Weapon, private walkSpeed?: number) {
    this.position = new Vec2D(x, y);
    this.paces = 0;
    this.gameHUD = gameHUD;
    this.screenWidth = Player.DEFAULT_SCREEN_WIDTH;

    if (!walkSpeed) {
      this.walkSpeed = Player.DEFAULT_WALK_SPEED;
    }

    this.playerInfo = new PlayerInfo({isDead: false, killCount: 0, deathCount: 0 });

    // Retrieve player name from local storage
    if (typeof(Storage) !== 'undefined'){
      const playerName = localStorage.getItem('name');
      this.playerInfo.setUserName = playerName;
    }
    
    this.walkTimer = 0;
  }

  public setWalkSpeed(speed: number): void {
    this.walkSpeed = speed;
  }

  public setWeapon(weapon: Weapon): void {
    this.weapon = weapon;
  }

  public setScreenWidth(width: number): void {
    this.screenWidth = width;
  }

  /***
   * Rotates Player: Simulates head turning. Wraps infinitely.
   *
   * @param angle Delta angle by how much the player rotates.
   */
  public rotate(angle: number): void {
    this.angle = (this.angle + angle + MathHelper.CIRCLE) % MathHelper.CIRCLE;
  }

  /***
   * The Player walks distance on WorldMap
   *
   * @param distance how far the player walks
   * @param map {@link Map}
   * @param direction which direction to walk
   */
  public walk(distance: number, map: Map2D, direction: number): void {
    const dx = Math.cos(direction) * distance;
    const dy = Math.sin(direction) * distance;
    if (map.getElementByPosition(new Vec2D(this.position.x + dx, this.position.y)).getType() !== MapElementType.WALL) {
      this.position.x += dx;
    }
    if (map.getElementByPosition(new Vec2D(this.position.x, this.position.y + dy)).getType() !== MapElementType.WALL) {
      this.position.y += dy;
    }
  }

  /***
   * Handles all the movement actions of the Player and communicates to the
   * server and plays sounds as needed.
   *
   * @param controls {@link Controls} interface between user and player.
   * @param map {@link Map} that the player is in.
   * @param seconds Seconds that have passed.
   * @param sendCallback 
   */
  public update(controls: Controls, map: Map2D, seconds: number, sendCallback: any): void {
    this.lastPaces = this.paces;
    let hasWalkedX = 0;
    let hasWalkedY = 0;
    let hasRotated = 0;
    const walkDelta = this.walkSpeed * seconds;

    if (this.playerInfo.isDead) {
      // If the player has died, we should not be able to shoot or move anymore.
      // Early return! Nothing past this point gets done if we're dead because
      // we don't want the player to be moving or shooting when he's dead.
      return;
    }

    // Turn left
    if (controls.states.get(KeyCodes.TURN_LEFT)) {
      ++hasRotated;
      this.rotate(-Math.PI * seconds);
    }

    // Turn right
    if (controls.states.get(KeyCodes.TURN_RIGHT)) {
      ++hasRotated;
      this.rotate(Math.PI * seconds);
    }

    // Mouse look left
    if (controls.states.get(KeyCodes.MOUSE_TURN_LEFT)) {
      ++hasRotated;
      if(controls.isMobile) {
        this.rotate(-Math.PI * (seconds * Controls.TOUCH_LOOK_SENSITIVITY));
      } else {
        this.rotate(Math.PI * (seconds * (controls.getMouseDelta() / this.screenWidth)) * Controls.MOUSE_LOOK_SENSITIVITY);
      }
      controls.states.set(KeyCodes.MOUSE_TURN_LEFT, false);
    }

    // Mouse look right
    if (controls.states.get(KeyCodes.MOUSE_TURN_RIGHT)) {
      ++hasRotated;
      if(controls.isMobile) {
        this.rotate(Math.PI * (seconds * Controls.TOUCH_LOOK_SENSITIVITY));
      } else {
        this.rotate(Math.PI * (seconds * (controls.getMouseDelta() / this.screenWidth)) * Controls.MOUSE_LOOK_SENSITIVITY);
      }
      controls.states.set(KeyCodes.MOUSE_TURN_RIGHT, false);
    }

    // Move forward
    if (controls.states.get(KeyCodes.FORWARD)) {
      this.walk(walkDelta, map, this.angle);
      ++hasWalkedY;
    }

    // Move back
    if (controls.states.get(KeyCodes.BACKWARD)) {
      this.walk(-walkDelta, map, this.angle);
      ++hasWalkedY;
    }

    // Move left
    if (controls.states.get(KeyCodes.STRAFE_LEFT)) {
      this.walk(walkDelta, map, this.angle - Math.PI / 2);
      ++hasWalkedX;
    }

    // Move right
    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) {
      this.walk(-walkDelta, map, this.angle - Math.PI / 2);
      ++hasWalkedX;
    }

    // Player-side movement handling and communication to server.
    // If we've moved or rotated, then we want to report that to the server,
    // and play a walking sound.
    if (hasWalkedX == 1 || hasWalkedY == 1 || hasRotated >= 1) {
      // If so, accumulate paces and send message to server
      this.paces += walkDelta;

      this.walkTimer += seconds;
      if (this.walkTimer > Enemy.WALK_INTERVAL * Enemy.STEP_SOUND_DIVIDER) {
        this.walkTimer = 0;
        Sound.get.play(SoundType.STEP, Sound.STEP_MAX_VOLUME);
      }
      sendCallback(PacketFactory.move(this.position.x, this.position.y, this.angle));
    }

    // Player-side weapon handling and communication to server.
    if (this.weapon) {
      if (controls.states.get(KeyCodes.SHOOT) && (this.weapon.getWeaponState === WeaponState.IDLE)) {
        this.weapon.shoot();

        // Send shoot message to server
        sendCallback(PacketFactory.shoot(this.angle));

        // If the weapon is semiautomatic, the player isn't able to hold down the button to shoot continuously.
        if (this.weapon.isSemiautomatic) {
          // Toggle the controls map shoot entry back to false.
          controls.states.set(KeyCodes.SHOOT, false);
        }
      }

      this.weapon.update(seconds);
    }

    if (controls.states.get(KeyCodes.SCOREBOARD)) {
      this.gameHUD.toggleScoreboard();
    }

    if (controls.states.get(KeyCodes.SETTINGS)) {
      this.gameHUD.toggleSettings();
    }

    if (controls.states.get(KeyCodes.FPS)) {
      this.gameHUD.toggleFPS();
    }
  }

  /**
   * Player death handling.
   */
  private die(){
    if(this.playerInfo.isDead){
      Sound.get.play(SoundType.DEATH, Player.DEATH_SOUND_VOLUME);
    }
  }

  /**
   * Check if player has moved in last tick. Used to prevent weapon bob.
   * @returns True if player has moved.
   */
  public hasMoved(): boolean {
    return this.lastPaces !== this.paces;
  }

  /**
   * Change health based on given delta. Calls death handling if health falls below zero.
   * @param delta positive or negative health deviation.
   */
  public changeHealth(delta: number) {
    if (this.health + delta < 0) {
      this.playerInfo.isDead = true;
      return; 
    } else if (this.health + delta >= Player.MAX_HEALTH) {
      this.health = Player.MAX_HEALTH;
    } else {
      this.health += delta;
    }
  }

  public set setDirection(d: number) {
    this.angle = d;
  }

  public set setPosition(p: Vec2D) {
    this.position = p;
  }

  public get getPlayerInfo() {
    return this.playerInfo;
  }

  public setDead(dead: boolean) {
    this.playerInfo.isDead = dead;
    this.die();
  }

  public get isDead(){
    return this.playerInfo.isDead;
  }

  public get getPosition(): Vec2D {
    return this.position;
  }

  public get getDirection(): number {
    return this.angle;
  }

  public get getWeapon(): Weapon {
    return this.weapon;
  }

  public get getPaces(): number {
    return this.paces;
  }

  public get getWalkSpeed(): number {
    return this.walkSpeed;
  }

  public set setPlayerInfo(playerInfo: PlayerInfo) {
    this.playerInfo = playerInfo;
  }
}

