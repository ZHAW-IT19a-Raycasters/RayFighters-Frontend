import { Controls } from '../player/controls';
import { GameLoop } from './gameloop';
import { Packet } from '../communication/packet';
import { Player } from '../player/player';
import { Renderer } from '../rendering/renderer';
import { Room } from '../maps/room';
import { Weapon } from '../player/weapon';
import { SocketState } from '../communication/socket';
import { PacketToGameLogic } from '../communication/packettogamelogic';
import { GameHUD } from '../ui/gameHud';

/**
 * Main {@link Game} instance.
 */
let game: Game;

/**
 * Runs the {@link Game} and entry point of the game logic
 * @param canvasName Id of the Canvas HTMLElement
 * @param fpsCounterName Id of the FPS Counter HTMLElement
 * @param gameHUD Heads-up display {@link GameHUD} to relay info to the user.
 * @param navigator Mocked navigator for unit testing.
 * @param canvas Mocked canvas for unit testing.
 * @param window Mocked window for unit testing.
 */
export function runGame(canvasName: string, fpsCounterName: string, gameHUD: GameHUD, navigator?: any, canvas?: any, window?: any): void {
  // Checks if it's running in node or browser. Needed to make the game class testable.
  if (typeof process === 'undefined') {
    game = new Game(canvasName, fpsCounterName, gameHUD);
  } else {
    game = new Game(canvasName, fpsCounterName, gameHUD, navigator, canvas, window);
  }
  startGameLoop();
}

/**
 * Main Game class. Initializes the player, map, socket connection and anything else needed for gameplay.
 */
export class Game {
  /**
   * URL of the server.
   */
  private static readonly SERVER_URL = "ws://127.0.0.1:8080/ws/1";

  /**
   * Default wall resolution.
   */
  private static readonly DEFAULT_RAYCASTER_RESOLUTION = 500;

  /**
   * Renderer instance. Needs to be updated upon window resize.
   */
  private renderer: Renderer;

  /**
   * Where the magic happens. The element that contains the canvas element to drawn in
   */
  private canvas: any;

  /**
   * Player instance.
   */
  private player: Player;

  /**
   * Current room.
   */
  private room: Room;

  /**
   * GameHUD instance. Shows info relevant to the player
   */
  private gameHUD: GameHUD;

  /**
   * Handles messages from server to game logic.
   */
  private packetToGameLogic: PacketToGameLogic;

  /**
   * Player input
   */
  private controls;

  /**
   * Game loop, runs the game and controls the timing.
   */
  private loop: GameLoop;

  /**
   * Current map ID.
   */
  private currentMapID: number;

  /**
   * Path to current map.
   */
  private currentMapPath: string;

  /**
   * Initializes the {@link Game}.
   * @param canvasName Name of {@link Canvas} instance.
   * @param fpsCounterName ID of the FPS counter HTML element.
   * @param gameHUD Heads-up display {@link GameHUD} to relay info to the user.
   * @param navigator Mocked navigator for unit testing.
   * @param canvas Mocked canvas for unit testing.
   * @param window Mocked window for unit testing.
   */
  constructor(canvasName: string, fpsCounterName: string, gameHUD: any, navigator?: any, canvas?: any, windowMock?: any) {
    // Controls and canvas setup. 
    if (typeof process === 'undefined') {
      this.controls = new Controls();
      this.canvas = document.getElementById(canvasName);
    } else {
      // Initializes with a mocked navigator & canvas object to make the class testable.
      this.controls = new Controls(navigator);
      this.canvas = canvas;
    }

    // Display PlayerInfo and Mapname on HUD
    this.gameHUD = gameHUD;
    this.setupPlayer();
    this.packetToGameLogic = new PacketToGameLogic(this.player, this.gameHUD); // Map ID is gotten here, can be undefined!!
    this.initializeRoom(this.checkMap());
    this.gameHUD.initializeHud(this.room.getMap.getMapName, this.player.getPlayerInfo);

    // Initialize renderer. 
    if (typeof process === 'undefined') {
      this.initializeRenderer();
      this.loop = new GameLoop(Game.SERVER_URL, fpsCounterName, (d: number) => { this.renderer.changeResolution(d) }, this.gameHUD);
    } else {
      // Initializes with a mocked window object to make the class testable.
      this.initializeRenderer(windowMock);
      this.loop = new GameLoop(Game.SERVER_URL, fpsCounterName, (d: number) => { return; }, this.gameHUD, windowMock);
    }

  }

  /**
   * {@link Room} Setup. Creates a {@link Room}.
   * @param mapPath Path to current map.
   */
  public initializeRoom(mapPath: string): void {
    this.room = new Room({ mapSize: 32, loadMap: mapPath });
  }

  /**
   * Creates a {@link Player}.
   */
  private setupPlayer(): void {
    // Player Setup
    this.player = new Player(
      6, 6,
      0.3 * Math.PI,
      this.gameHUD,
      new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4));
  }

  /**
   * Initializes the {@link Renderer} with its default settings.
   */
  public initializeRenderer(windowMock?: any): void {
    if (windowMock) {
      this.renderer = new Renderer(this.canvas, Game.DEFAULT_RAYCASTER_RESOLUTION, 32, 0.6, this.room.getMap.getFloorGradient, this.room.getMap.getCeilingGradient, windowMock);
      startDynamicResolution(windowMock);
    } else {
      this.renderer = new Renderer(this.canvas, Game.DEFAULT_RAYCASTER_RESOLUTION, 32, 0.6, this.room.getMap.getFloorGradient, this.room.getMap.getCeilingGradient);
      startDynamicResolution();
    }
  }

  /**
   * Loads a new map and re-initializes {@link Renderer} and {@link GameHUD}.
   * @param newMapPath path to new map.
   */
  public loadMap(newMapPath: string): void {
    game.initializeRoom(newMapPath);
    game.initializeRenderer();
    game.getGameHUD.showTicket('Loading map...');
    game.gameHUD.initializeHud(game.room.getMap.getMapName, game.player.getPlayerInfo);
  }

  /**
   * Checks for the current map ID obtained from server.
   * @returns The path to the current map.
   */
  public checkMap(): string {
    this.currentMapID = this.packetToGameLogic.getCurrentMapID;
    this.currentMapPath = this.mapIDToString(this.currentMapID);
    return this.currentMapPath;
  }

  /**
   * Dumb solution for now. Translates map ID to map path.
   * TODO: Read from JSON file
   * @param id map ID
   * @returns map path
   */
  private mapIDToString(id: number): string {
    let path: string;
    switch (id) {
      case 0: path = "maps/city_yard.txt"; break;
      case 1: path = "maps/desert.txt"; break;
      case 2: path = "maps/sundown_resort.txt"; break;
      case 3: path = "maps/vapor_land.txt"; break;
      case 4: path = "maps/weeaboo_city.txt"; break;
      default: break;
    }
    return path;
  }

  /**
   * Checks if the connection to the server is alive.
   * @param state {@link SocketState} that will be checked. Needs to be passed from {@link GameLoop}.
   * @returns True if alive, False if failed
   */
  public checkConnection(): boolean {
    if (this.loop.getSocketState !== SocketState.CONNECTED) {
      // Error case
      return false;
    }
    // Success case
    return true;
  }

  /**
   * Checks if a map was received from server yet.
   * @returns True if the map was loaded.
   */
  public isMapLoaded(): boolean {
    if (this.currentMapID == undefined || this.currentMapPath == undefined) {
      return false;
    }
    return true;
  }

  public get getLoop(): GameLoop {
    return this.loop;
  }

  public get getMapPath(): string {
    return this.currentMapPath;
  }

  public get getPlayer(): Player {
    return this.player;
  }

  public get getCanvas(): any {
    return this.canvas
  }

  public get getCurrentMapPath(): string {
    return this.currentMapPath;
  }


  public get getRenderer(): Renderer {
    return this.renderer;
  }

  public get getRoom(): Room {
    return this.room;
  }


  public get getGameHUD(): GameHUD {
    return this.gameHUD;
  }


  public get getPacketToGameLogic(): PacketToGameLogic {
    return this.packetToGameLogic;
  }


  public get getControls(): Controls {
    return this.controls;
  }


}

/**
 * Listen to window resizes, and in case of that, re-initialize {@link Renderer} to prevent images from stretching.
 * @param windowMock Mocked window object used for testing.
 */
function startDynamicResolution(windowMock?: any) {
  // Return if running in node (Jasmine testing)
  if (windowMock) {
    return;
  }

  // Sett window resize listener
  window.addEventListener('resize', function () {
    game.initializeRenderer();
    game.getLoop.restartDynamicResolution();
    game.getPlayer.setScreenWidth(game.getCanvas.width);
  }, true);

}

/**
 * Initializes the {@link GameLoop}.
 */
function startGameLoop() {
  // Starts the game loop using this frame handler.
  game.getLoop.begin(function (time: number, receivedPackets: Array<Packet>, sendCallback: any) {
    // Detect if server connection has encountered an error
    if (game.checkConnection() && game.isMapLoaded()) {
      // Socket connection not yet initialized and no map loaded right now.
      let lastMapPath = game.getCurrentMapPath;

      // Refresh sprite array and cycle walk animation
      game.getRoom.updateEnemyEntities(game.getPacketToGameLogic.getEnemies);
      game.getRoom.updateEnemies(time);

      // Update player positions, controls, map, time and sendCallback for communicating with the server.
      game.getPlayer.update(game.getControls, game.getRoom.getMap, time, sendCallback);

      game.getRenderer.render(game.getRoom, game.getPlayer, time);

      receivedPackets.forEach(p => {
        game.getPacketToGameLogic.handlePacket(p);
      })

      // Check if map has changed 
      // TODO: solve with callback, this approach is a bit boneheaded
      let newMapPath = game.checkMap();
      if (newMapPath != lastMapPath) {
        game.loadMap(newMapPath);
      }
    } else {
      // Check for map change packet
      if (game.checkConnection()) {
        receivedPackets.forEach(p => {
          game.getPacketToGameLogic.handlePacket(p);
        })
      }

      // Look if map ID was delivered by server
      let lastMapPath = game.getCurrentMapPath;
      let newMapPath = game.checkMap();

      // If the map ID was received, load the map
      if (lastMapPath != newMapPath) {
        game.loadMap(newMapPath);
      }
    }
  });
}