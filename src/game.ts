import { Controls } from './controls';
import { GameLoop } from './gameloop';
import { Player } from './player';
import { Image2D, Renderer } from './renderer';
import { Room } from './room';

function runGame(canvasName: string, fpsCounterName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let room = new Room({ mapSize: 32, loadMap: 'map1.txt' });
  console.log(room.getMap.toString())
  let renderer = new Renderer(canvas, 300, 32, 0.6);
  let loop = new GameLoop(fpsCounterName);
  let controls = new Controls();
  let player = new Player(1,1,0.3*Math.PI);

  room.setSkyBox(new Image2D("./assets/sceneries/desert.jpg", 3510, 1440))
  room.getWallImages.push(new Image2D("./assets/walls/concrete_neon_blue.jpg", 2048, 2048))

  loop.begin(function (time: number) {
    // Begin gameloop using this frame handler
    player.update(controls, room.getMap, time)    
    renderer.render(room, player);
  });
}

runGame('game-canvas', 'fps-counter');
