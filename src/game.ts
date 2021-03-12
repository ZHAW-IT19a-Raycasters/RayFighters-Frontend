import { GameLoop } from './gameloop';
import { Renderer } from './renderer';

function runGame(canvasName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let renderer = new Renderer(canvas, 320, 0.8);
  let loop = new GameLoop();

  loop.begin(function(time: number) {
    // Begin gameloop using this frame handler
    renderer.render();
  });
}

runGame(/*on*/"game-canvas");
