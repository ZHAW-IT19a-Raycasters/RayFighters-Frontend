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

let game: Game;

/**
 * Runs the Game
 * @param canvasName Id of the Canvas HTMLElement
 * @param fpsCounterName Id of the FPS Counter HTMLElement
  */
export function runGame(canvasName: string, fpsCounterName: string): void {
  game = new Game();
  game.initializeGame(canvasName, fpsCounterName);
}


export class Game {
  /**
   * Renderer instance. Needs to be updated upon window resize.
   */
  public renderer: Renderer;

  /**
   * Where the magic happens.
   */
  private canvas: any;

  /**
   * Player instance.
   */
  public player: Player;

  /**
   * Current room.
   */
  public room: Room;

  public gameHUD: GameHUD;
  public serverConnection: PacketToGameLogic;
  private static readonly SERVER_URL = "ws://127.0.0.1:8080/ws/1";
  private static readonly DEFAULT_RAYCASTER_RESOLUTION = 500;
  public controls = new Controls();
  private loop: GameLoop;
  private currentMapID: number;
  private currentMapPath: string;

  public initializeGame(canvasName: string, fpsCounterName: string) {
    // Canvas Setup. 
    // The element that contains the canvas element to drawn in
    this.canvas = document.getElementById(canvasName);

    // Display PlayerInfo and Mapname on HUD
    this.gameHUD = new GameHUD();
    this.setupPlayer();
    this.serverConnection = new PacketToGameLogic(this.player, this.gameHUD); // Map ID is gotten here, can be undefined!!
    this.initializeRoom(this.checkMap());
    this.gameHUD.initializeHud(this.room.getMap.getMapName, this.player.getPlayerInfo);


    this.initializeRenderer();

    this.loop = new GameLoop(Game.SERVER_URL, fpsCounterName, (d: number) => { this.renderer.changeResolution(d) }, this.gameHUD);

    startDynamicResolution();
    startGameLoop();
  }

  // Room Setup. Creates a room
  public initializeRoom(mapPath: string) {
    this.room = new Room({ mapSize: 32, loadMap: mapPath });
  }

  private setupPlayer(): void {
    // Player Setup
    this.player = new Player(
      6, 6,
      0.3 * Math.PI,
      this.gameHUD,
      new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4));
  }



  /**
 * Initializes the renderer with its default settings.
 */
  public initializeRenderer() {
    this.renderer = new Renderer(this.canvas, Game.DEFAULT_RAYCASTER_RESOLUTION, 32, 0.6, this.room.getMap.getFloorGradient, this.room.getMap.getCeilingGradient);
  }

  public checkMap(): string {
    this.currentMapID = this.serverConnection.getCurrentMapID;
    this.currentMapPath = this.mapIDToString(this.currentMapID);
    return this.currentMapPath;
  }

  /**
   * Dumb solution for now. 
   * TODO: Read from JSON file
   * @param id 
   * @returns 
   */
  private mapIDToString(id: number) {
    let path: string;
    switch (id) {
      case 0: path = "city_yard.txt"; break;
      case 1: path = "desert.txt"; break;
      case 2: path = "sundown_resort.txt"; break;
      case 3: path = "vapor_land.txt"; break;
      case 4: path = "weeaboo_city.txt"; break;
      default: break;
    }
    return path;
  }

  /**
   * Checks if the connection to the server is alive.
   * @param state SocketState that will be checked. Needs to be passed from Game Loop.
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
}

function startDynamicResolution() {
  // Listen to window resizes, and in case of that, re-initialize renderer to prevent images from stretching.
  window.addEventListener('resize', function () {
    game.initializeRenderer();
    game.getLoop.restartDynamicResolution();
    game.getPlayer.setScreenWidth(game.getCanvas.width);
  }, true);
}

function startGameLoop() {
  // Starts the game loop using this frame handler.
  game.getLoop.begin(function (time: number, receivedPackets: Array<Packet>, sendCallback: any) {
    // Detect if server connection has encountered an error
    if (game.checkConnection() && game.isMapLoaded()) {
      // Socket connection not yet initialized and no map loaded right now.
      let lastMapPath = game.getCurrentMapPath;

      // Refresh sprite array and cycle walk animation
      game.room.updateEnemyEntities(game.serverConnection.getEnemies);
      game.room.updateEnemies(time);

      // Update player positions, controls, map, time and sendCallback for communicating with the server.
      game.player.update(game.controls, game.room.getMap, time, sendCallback);

      game.renderer.render(game.room, game.player, time);
      receivedPackets.forEach(p => {
        this.serverConnection.handlePacket(p);
      })

      // Check if map has changed
      let newMapPath = game.checkMap();
      if (newMapPath != lastMapPath) {
        game.initializeRoom(newMapPath);
        game.initializeRenderer();
      }
    } else {
      game.gameHUD.showTicket('No map loaded yet.');

      // Check for map as long as it takes
      game.checkMap();
    }
  });
}



