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
 * Only for testing and mocking purposes.
 * This is only used if ran from Node (Jasmin)
 * @param {Game} testGame - Game instance to be overwritten.
 */
export function setGameInstance(testGame: Game){
  game = testGame;
}

/**
 * Runs the {@link Game} and entry point of the game logic
 * @param {string} canvasName - Id of the Canvas HTMLElement
 * @param {string} fpsCounterName - Id of the FPS Counter HTMLElement
 * @param {GameHud} gameHUD - Heads-up display {@link GameHUD} to relay info to the user.
 * @param navigator - Mocked navigator for unit testing.
 * @param canvas - Mocked canvas for unit testing.
 * @param window - Mocked window for unit testing.
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
   * URL of the server. In this case 
   */
  private static readonly DEV_SERVER_URL = "ws://127.0.0.1:8080/ws/1";

  /**
   * Default raycasting resolution. (How many strips/bars are rendered).
   * We've found 500 to be an OK compromise between performance and graphics.
   */
  private static readonly DEFAULT_RAYCASTER_RESOLUTION = 500;

  /**
   * Renderer instance. Needs to be updated upon window resize.
   */
  private renderer: Renderer;

  /**
   * HTML canvas element reference
   */
  private canvas: any;

  /**
   * Player instance.
   */
  private player: Player;

  /**
   * Current room (contains map and other things, see {@link Room}).
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
   * Player input from the browser
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
   * @param {string} canvasName - Name of {@link Canvas} instance.
   * @param {string} fpsCounterName - ID of the FPS counter HTML element.
   * @param {GameHUD} gameHUD - Heads-up display {@link GameHUD} to relay info to the user.
   * @param navigator - Mocked navigator for unit testing.
   * @param canvas - Mocked canvas for unit testing.
   * @param window - Mocked window for unit testing.
   */
  constructor(canvasName: string, fpsCounterName: string, gameHUD: any, navigator?: any, canvas?: any, windowMock?: any) {
    // Controls and canvas setup. 
    if (typeof process === 'undefined') {
      // If we're in the browser, then we proceed as normal
      this.controls = new Controls();
      this.canvas = document.getElementById(canvasName);
    } else {
      // We're in node, so some things are not available.
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
      // Browser environment, proceed as productive
      this.initializeRenderer();
      this.loop = new GameLoop(Game.DEV_SERVER_URL, fpsCounterName, (d: number) => { this.renderer.changeResolution(d) }, this.gameHUD);
    } else {
      // Initializes with a mocked window object to make the class testable. (we're ran from node instead of the browser)
      this.initializeRenderer(windowMock);
      this.loop = new GameLoop(Game.DEV_SERVER_URL, fpsCounterName, (d: number) => { return; }, this.gameHUD, windowMock);
    }

  }

  /**
   * {@link Room} Setup. Creates a {@link Room}.
   * @param {string} mapPath - Path to current map.
   * @param readFromFile - Reading from file method for testing purposes
   */
  public initializeRoom(mapPath: string, readFromFile?: any): void {
    this.room = new Room({ mapSize: 32, loadMap: mapPath, readFromFile: readFromFile });
  }

  /**
   * Initializes the single {@link Player} instance.
   */
  private setupPlayer(): void {
    // Just initial values for the players X,Y. Note that these are overwritten
    // from the server later anyways.
    const initPlayerX = 6;
    const initPlayerY = 6;
    // Direction we're first looking in. Also overwritten on successful connection
    const initAngle = 0.3 * Math.PI;
    // For now, we just give the same hitscan one-hit-kill weapon to all the players
    const initWeapon = new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4);

    // Player Setup
    this.player = new Player(
      initPlayerX, initPlayerY,
      initAngle,
      this.gameHUD,
      initWeapon);
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
   * 
   * @param {string} newMapPath - path to new map.
   */
  public loadMap(newMapPath: string, windowMock?: any, readFromFile?: any): void {
    game.initializeRoom(newMapPath, readFromFile);
    
    // Mocked window handling for unit tests.
    if(windowMock) {
      return;
    }
      
    game.initializeRenderer();
    game.getGameHUD.showTicket('Loading map...');
    game.gameHUD.initializeHud(game.room.getMap.getMapName, game.player.getPlayerInfo);
  }

  /**
   * Checks for the current map ID obtained from server.
   * 
   * We get the current map ID from PacketToGameLogic and set the map indicated
   * by that ID
   * 
   * @param {number} overrideMapID - Overridden map ID. Only needed for testing (for jasmin environment).
   * @returns The path to the current map.
   */
  public checkMap(overrideMapID?: number): string {
    let mapID: number;

    // Check for overridden map ID. Only needed for testing.
    if(overrideMapID){
      mapID = overrideMapID;
    } else {
      mapID = this.packetToGameLogic.getCurrentMapID;
    }
    this.currentMapID = mapID;
    this.currentMapPath = this.mapIDToString(this.currentMapID);
    return this.currentMapPath;
  }

  /**
   * Translates map ID to map path. Must be adjusted when adding a new map.
   *
   * Note that we hard coded this for now. In the future this could be solved with a JSON
   *
   * @param {number} id - map ID
   * @returns {Map} path
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
   *
   * @param {boolean} state - {@link SocketState} that will be checked. Needs to be passed from {@link GameLoop}.
   * @returns True if alive, False if failed
   */
  public checkConnection(): boolean {
    return (this.loop.getSocketState === SocketState.CONNECTED);
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

  /**
   * Getter for gameloop instance
   */
  public get getLoop(): GameLoop {
    return this.loop;
  }

  /**
   * Getter for player instance
   */
  public get getPlayer(): Player {
    return this.player;
  }

  /**
   * Getter for canvas reference
   */
  public get getCanvas(): any {
    return this.canvas
  }

  /**
   * Getter for map path
   */
  public get getCurrentMapPath(): string {
    return this.currentMapPath;
  }


  /**
   * Getter for renderer instance
   */
  public get getRenderer(): Renderer {
    return this.renderer;
  }

  /**
   * Getter for room instance
   */
  public get getRoom(): Room {
    return this.room;
  }


  /**
   * Getter for gamehud instance
   */ 
  public get getGameHUD(): GameHUD {
    return this.gameHUD;
  }

  /**
   * Getter for PacketToGameLogic instance
   */
  public get getPacketToGameLogic(): PacketToGameLogic {
    return this.packetToGameLogic;
  }

  /**
   * Getter for controls instance
   */
  public get getControls(): Controls {
    return this.controls;
  }
}

/**
 * Listen to window resizes, and in case of that, re-initialize
 * {@link Renderer} to prevent images from stretching.

 * @param windowMock - Mocked window object used for testing.
 */
function startDynamicResolution(windowMock?: any) {
  if (windowMock) {
    // Return if running in node (Jasmine testing)
    return;
  }

  // This should happen when the browser window has been resized
  window.addEventListener('resize', function () {
    game.initializeRenderer();
    game.getLoop.restartDynamicResolution();
    game.getPlayer.setScreenWidth(game.getCanvas.width);
  }, true);

}

/**
 * Sets up the {@link GameLoop}. If you were looking for the core gameloop,
 * well, this is it.
 * 
 * Here we set what happens in a frame (or rather, game tick). 
 */
export function startGameLoop() {
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

      // Draw the frame using the renderer
      game.getRenderer.render(game.getRoom, game.getPlayer, time);

      receivedPackets.forEach(pkt => {
        game.getPacketToGameLogic.handlePacket(pkt);
      })

      // Check if map has changed 
      // TODO: solve with callback, this approach is a bit primitive (but works like a charm)
      let newMapPath = game.checkMap();
      if (newMapPath != lastMapPath) {
        game.loadMap(newMapPath);
      }
    } else {
      // Check for map change packet
      if (game.checkConnection()) {
        receivedPackets.forEach(pkt => {
          game.getPacketToGameLogic.handlePacket(pkt);
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
