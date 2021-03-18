import { Controls } from './controls';
import { GameLoop } from './gameloop';
import { KeyCodes } from './keycodes';
import { Renderer } from './renderer';

function runGame(canvasName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let renderer = new Renderer(canvas, canvas.clientWidth, 0.8);
  let loop = new GameLoop();
  let controls = new Controls();
  let offset = 0;
  let x: number = 0;
  let y: number = 0;

  loop.begin(function (time: number) {
    // Begin gameloop using this frame handler
    renderer.render();
    let text = document.getElementById("controlstest")
    offset = time*500;

    if (controls.states.get(KeyCodes.FORWARD)) {
      y += offset;
    }
    if (controls.states.get(KeyCodes.BACKWARD)) {
      y += -offset;
    }
    if (controls.states.get(KeyCodes.STRAFE_LEFT)) {
      x += -offset;
    }
    if (controls.states.get(KeyCodes.STRAFE_RIGHT)) {
      x += offset;
    }
    if (controls.states.get(KeyCodes.TURN_LEFT)) {
      x += -offset;
      y -= offset;
    }
    if (controls.states.get(KeyCodes.TURN_RIGHT)) {
      x += offset;
      y -= offset;
    }
    if (controls.states.get(KeyCodes.MOUSE_TURN_LEFT)) {
      x += -offset;
      y -= offset;
      controls.states.set(KeyCodes.MOUSE_TURN_LEFT, false)
    }
    if (controls.states.get(KeyCodes.MOUSE_TURN_RIGHT)) {
      x += offset;
      y -= offset;
      controls.states.set(KeyCodes.MOUSE_TURN_RIGHT, false)
    }
    if (controls.states.get(KeyCodes.SHOOT)) {
      text.innerText += ' BANG'
    }
    renderer.move(x, y)
  });
}

runGame(/*on*/"game-canvas");
