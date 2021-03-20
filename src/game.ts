import { GameLoop } from './gameloop';
import { Map2D, MapElement, MapElementType } from './map2d';
import { Renderer } from './renderer';
import { Room } from './room';
import { Vec2D } from './vec2d';

function runGame(canvasName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let renderer = new Renderer(canvas, 320, 0.8);
  let room = new Room(4, true)
  let loop = new GameLoop();

  loop.begin(function(time: number) {
    // Begin gameloop using this frame handler
    renderer.render();
  });
}

runGame(/*on*/"game-canvas");
