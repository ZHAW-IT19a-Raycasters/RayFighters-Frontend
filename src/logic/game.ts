import { Controls } from '../player/controls';
import { GameLoop } from './gameloop';
import { Packet } from '../communication/packet';
import { Player } from '../player/player';
import { Renderer } from '../rendering/renderer';
import { Room } from '../maps/room';
import { Weapon } from '../player/weapon';
import { SocketState } from '../communication/socket';
import { PacketToGameLogic } from '../communication/packettogamelogic';
import { initializeHud } from '../gameHud';
import { showAlert } from '..';

/**
 * Renderer instance. Needs to be updated upon window resize.
 */
var renderer: Renderer;

/**
 * Where the magic happens.
 */
var canvas: HTMLElement;

/**
 * Player instance.
 */
var player: Player;

/**
 * Current room.
 */
var room: Room

/**
 * Debug boolean for websocket state. 
 * If true, the game requires the WebSocket connection to be established. If false, the game starts without a server connection.
 */
var webSocketConnectionRequired: boolean = false; 

var serverConnection: PacketToGameLogic;

const SERVER_URL = "ws://127.0.0.1:8080/ws/1";
const DEFAULT_RAYCASTER_RESOLUTION = 500;

/**
 * Initializes the renderer with its default settings.
 */
function initializeRenderer() {
  renderer = new Renderer(canvas, DEFAULT_RAYCASTER_RESOLUTION, 32, 0.6, room.getMap.getFloorGradient, room.getMap.getCeilingGradient);
}

/**
 * Runs the Game
 * @param canvasName Id of the Canvas HTMLElement
 * @param fpsCounterName Id of the FPS Counter HTMLElement
  */
export function runGame(canvasName: string, fpsCounterName: string): void {
  // Canvas Setup. 
  // The element that contains the canvas element to drawn in
  canvas = document.getElementById(canvasName);

  // Room Setup. Creates a room
  // TODO gather map from server!
  room = new Room({ mapSize: 32, loadMap: 'maps/desert.txt' });

  // Player Setup
  player = new Player(6, 6, 0.3 * Math.PI,  new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, true, 0.4));
  initializeRenderer();

  // Display PlayerInfo and Mapname on HUD
  initializeHud(room.getMap.getMapName, player.getPlayerInfo);

  let controls = new Controls();
  let loop = new GameLoop(fpsCounterName, (d: number) => { renderer.changeResolution(d) });

  // Listen to window resizes, and in case of that, re-initialize renderer to prevent images from stretching.
  window.addEventListener('resize', function () {
    initializeRenderer();
    loop.restartDynamicResolution();
  }, true);

  serverConnection = new PacketToGameLogic(player);

  /**
   * Checks if the connection to the server is alive.
   * @param state SocketState that will be checked. Needs to be passed from Game Loop.
   * @returns True if alive, False if failed
   */
  function checkConnection(state: SocketState): boolean {
    if (webSocketConnectionRequired && loop.getSocketState !== SocketState.CONNECTED){
      // Error case
      return false;
    }
    // Success case
    return true;
  }

  // Starts the game loop using this frame handler.
  loop.begin(function (time: number, receivedPackets: Array<Packet>, sendCallback: any) {
    // Detect if server connection has encountered an error
    if (checkConnection(loop.getSocketState) == false) {
      alert("Connection to server failed! Exiting the game.");
      showAlert("Connection to server failed! Exiting the game.");
      // TODO: End game loop - Return to landing page
      return;
    }

    // Refresh sprite array and cycle walk animation
    room.updateEnemyEntities(serverConnection.getEnemies);
    room.updateEnemies(time);

    // Update player positions, controls, map, time and sendCallback for communicating with the server.
    player.update(controls, room.getMap, time, sendCallback);

    renderer.render(room, player, time);
    receivedPackets.forEach(p => {
      serverConnection.handlePacket(p);
    })
  });

}