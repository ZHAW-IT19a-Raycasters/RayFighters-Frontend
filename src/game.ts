import { Controls } from './controls';
import { GameLoop } from './gameloop';
import { OpCode, Packet } from './packet';
import { Player } from './player';
import { Image2D, Renderer } from './renderer';
import { Room } from './room';
import { Weapon } from './weapon';

function runGame(canvasName: string, fpsCounterName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let room = new Room({ mapSize: 32, loadMap: 'map1.txt' });
  console.log(room.getMap.toString());
  let renderer = new Renderer(canvas, 300, 32, 0.6, Renderer.STANDARD_CEILING_GRADIENT/*, Renderer.STANDARD_FLOOR_GRADIENT*/);
  let loop = new GameLoop(fpsCounterName);
  let controls = new Controls();
  let player = new Player(1, 1, 0.3 * Math.PI, new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, './assets/audio/shoot_1.mp3'));

  room.setSkyBox(new Image2D("./assets/sceneries/skyline.jpg", 3510, 1440));
  room.getWallImages.push(new Image2D("./assets/walls/concrete.jpg", 2048, 2048));

  loop.begin(function (time: number, receivedPackets: Array<Packet>, sendCallback: any) {
    // Begin gameloop using this frame handler
    player.update(controls, room.getMap, time);
    renderer.render(room, player, time);
    sendCallback(new Packet({opCode: OpCode.CLIENT_UNKNOWN}));
    receivedPackets.forEach(p => {
      console.log(p.opCode)
    })
  });
}

runGame('game-canvas', 'fps-counter');
