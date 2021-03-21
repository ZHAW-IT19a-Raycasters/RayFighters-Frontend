import { Controls, KeyCodes } from './controls';
import { GameLoop } from './gameloop';
import { Map2D, MapElement, MapElementType } from './map2d';
import { Player } from './player';
import { Image2D, Renderer } from './renderer';
import { Room } from './room';
import { Vec2D } from './vec2d';

function runGame(canvasName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let room = new Room(32, true)
  console.log(room.getMap.toString())
  let renderer = new Renderer(canvas, 300, 32, 0.6);
  let loop = new GameLoop();
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

runGame(/*on*/"game-canvas");
