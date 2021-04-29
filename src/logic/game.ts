import { Controls } from '../player/controls';
import { GameLoop } from './gameloop';
import { Packet } from '../communication/packet';
import { Player } from '../player/player';
import { Renderer } from '../rendering/renderer';
import { Room } from '../maps/room';
import { Weapon } from '../player/weapon';
import { OpCode } from '../communication/opcode';
import { SocketState } from '../communication/socket';

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

/**
 * Initializes the renderer with its default settings.
 */
function initializeRenderer() {
  renderer = new Renderer(canvas, 500, 32, 0.6, room.getMap.getFloorGradient, room.getMap.getCeilingGradient);
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
  player = new Player(6, 6, 0.3 * Math.PI,  new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, './assets/audio/9mm.mp3'));
  initializeRenderer();
  let controls = new Controls();
  let loop = new GameLoop(fpsCounterName, (d: number) => { renderer.changeResolution(d) });

  // Listen to window resizes, and in case of that, re-initialize renderer to prevent images from stretching.
  window.addEventListener('resize', function () {
    initializeRenderer();
    loop.restartDynamicResolution();
  }, true);

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
      // TODO: End game loop - Return to landing page
      return;
    }
    // Update player positions, controls, map, time and sendCallback for communicating with the server.
    player.update(controls, room.getMap, time, sendCallback);
    renderer.render(room, player, time);
    receivedPackets.forEach(p => {
      handleServerMessages(p);
    })
  });
}

function handleServerMessages(p: Packet) {
  switch (p.opCode) {
    case OpCode.SERVER_PLAYERDEATH:
      alert("You have died!");
      // TODO: Handle player death
      break;
    case OpCode.SERVER_DISCONNECT:
      alert("Server has disconnected!");
      // TODO: Handle disconnect
      break;
    case OpCode.SERVER_UNKNOWN:
      alert("Server has sent unknown message");
      // TODO: Handle unknown
      break;
    case OpCode.SERVER_MOVEMENT:
      alert("Player with ID" + p.userID + "has moved to" + p.coorX + "|" + p.coorY);
      break;
    case OpCode.SERVER_YOUARECALLED:
      alert("Your ID is: " + p.name);
      // TODO: Save player's ID
      break;
    case OpCode.SERVER_PLAYERJOINED:
      alert("New player has joined: ID " + p.name);
      // TODO: Create new enemy sprite
      break;
    case OpCode.SERVER_PLAYERLEFT:
      alert("Player has left: ID " + p.name);
      // TODO: Remove enemy
      break;
    case OpCode.SERVER_SENDALLPLAYERINFO:
      alert("Server has sent all player info");
      // TODO: Handle player info
      break;
    case OpCode.SERVER_SENDALLPLAYERKD:
      alert("Server has sent all player K/D");
      // TODO: Handle player K/D
      break;
    case OpCode.SERVER_TELEPORT:
      alert("Player with ID" + p.userID + "has been teleported to" + p.coorX + "|" + p.coorY);
      // TODO: Handle teleport
      break;
    case OpCode.SERVER_SHOOTING:
      alert("Player with ID" + p.userID + "has shot in angle " + p.angle);
      // TODO: Handle player K/D
      break;
    default:
      break;
  }
}