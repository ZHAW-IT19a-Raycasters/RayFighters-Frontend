import { Controls } from '../player/controls';
import { GameLoop } from './gameloop';
import { Packet } from '../communication/packet';
import { Player } from '../player/player';
import { Renderer } from '../rendering/renderer';
import { Room } from '../maps/room';
import { Weapon } from '../player/weapon';
import { Command } from '../communication/command';
import { OpCode } from '../communication/opcode';
import { Vec2D } from '../common/vec2d';

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
 * Initializes renderer.
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
  // The element that contains the canvas element to drawn in
  canvas = document.getElementById(canvasName);
  room = new Room({ mapSize: 32, loadMap: 'maps/desert.txt' });
  console.log(room.getMap.toString());
  player = new Player(6, 6, 0.3 * Math.PI,  new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, './assets/audio/9mm.mp3'));
  initializeRenderer();
  let controls = new Controls();
  let loop = new GameLoop(fpsCounterName, (d: number) => { renderer.changeResolution(d) });

  // Listen to window resizes, and in case of that, re-initialize renderer to prevent images from stretching.
  window.addEventListener('resize', function () {
    initializeRenderer();
    loop.restartDynamicResolution();
  }, true);

  loop.begin(function (time: number, receivedPackets: Array<Packet>, sendCallback: any) {
    // Begin gameloop using this frame handler
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