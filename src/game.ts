import { GameLoop } from './gameloop';
import { Map2D, MapElement, MapElementType } from './map2d';
import { Renderer } from './renderer';
import { Room } from './room';
import { Vec2D } from './vec2d';

// For testing purposes:
function genDemoMap() {
  let room = new Room(4, false);
  room.getMap.setElem(new Vec2D(2, 0), new MapElement(MapElementType.WALL));
  room.getMap.setElem(new Vec2D(2, 1), new MapElement(MapElementType.WALL));
  room.getMap.setElem(new Vec2D(3, 2), new MapElement(MapElementType.WALL));
  return room;
}

function runGame(canvasName: string): void {
  // The element that contains the canvas element to drawn in
  let canvas = document.getElementById(canvasName);
  let renderer = new Renderer(canvas, 320, 0.8);
  let room = genDemoMap()
  let loop = new GameLoop();

  // For testing purposes:
  console.log(room.getMap.toString());
  const playerPos = new Vec2D(1.5, 1.1);
  console.log(playerPos.toString());
  let steps = room.getMap.rayCast(playerPos, 0, 8);
  
  console.log(steps);

  loop.begin(function(time: number) {
    // Begin gameloop using this frame handler
    renderer.render();
  });
}

runGame(/*on*/"game-canvas");
