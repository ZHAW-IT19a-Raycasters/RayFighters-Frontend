import { GameLoop, FrameCallback } from './gameloop';
import { Camera } from './camera';

function runGame(canvasName: string): void {
  // The element that contains the 
  let canvas = document.getElementById(canvasName);
  let camera = new Camera(canvas, 320, 0.8);
  let loop = new GameLoop();

  loop.begin(function(time: number) {
    camera.render();
  });
}

runGame("game-canvas");
