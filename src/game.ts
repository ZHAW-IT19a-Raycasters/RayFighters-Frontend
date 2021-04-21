import { Controls } from './controls';
import { GameLoop } from './gameloop';
import { Packet } from './communication/packet';
import { Player } from './player';
import { Renderer } from './rendering/renderer';
import { Room } from './room';
import { Weapon } from './weapon';
import { Command } from './communication/command';

/**
 * Renderer instance. Needs to be updated upon window resize.
 */
var renderer: Renderer;

/**
 * Where the magic happens.
 */
var canvas: HTMLElement;

var player: Player;

var room: Room

/**
 * Initializes renderer.
 */
function initializeRenderer() {
  renderer = new Renderer(canvas, 300, 32, 0.6, room.getMap.getFloorGradient, room.getMap.getCeilingGradient);

}

function runGame(canvasName: string, fpsCounterName: string): void {
  // The element that contains the canvas element to drawn in
  canvas = document.getElementById(canvasName);
  room = new Room({ mapSize: 32, loadMap: 'maps/testmap.txt' });
  console.log(room.getMap.toString());
  player = new Player(6, 6, 0.3 * Math.PI, new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, './assets/audio/9mm.mp3'));
  initializeRenderer()
  let loop = new GameLoop(fpsCounterName);
  let controls = new Controls();

  // Listen to window resizes, and in case of that, re-initialize renderer to prevent images from stretching.
  window.addEventListener('resize', function () {
    initializeRenderer();
  }, true);


  loop.begin(function (time: number, receivedPackets: Array<Packet>, sendCallback: any) {
    // Begin gameloop using this frame handler
    player.update(controls, room.getMap, time);
    renderer.render(room, player, time);
    sendCallback(Command.unknown());
    receivedPackets.forEach(p => {
      console.log(p.opCode)
    })
  });
}

runGame('game-canvas', 'fps-counter');
