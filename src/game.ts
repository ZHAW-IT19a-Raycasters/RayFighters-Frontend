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
  let room = new Room({ mapSize: 32, loadMap: 'maps/testmap.txt' });
  console.log(room.getMap.toString());
  let renderer = new Renderer(canvas, 300, 32, 0.6, Renderer.STANDARD_CEILING_GRADIENT/*, Renderer.STANDARD_FLOOR_GRADIENT*/);
  let loop = new GameLoop(fpsCounterName);
  let controls = new Controls();
  let player = new Player(6, 6, 0.3 * Math.PI, new Weapon('./assets/weapons/9mm/9mm_idle.png', ['./assets/weapons/9mm/9mm_s1.png', './assets/weapons/9mm/9mm_s2.png'], 180, 180, './assets/audio/shoot_1.mp3'));

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
//runGame('game-canvas', 'fps-counter');

const startForm: HTMLFormElement = document.querySelector('#startGameForm');
const gameControls: HTMLElement = document.querySelector('#gameControls');
const sharebtn: HTMLElement = document.querySelector('#sharebtn');

startForm.addEventListener('submit', function(e){
  e.preventDefault();

  const formData = new FormData(startForm);

  const playerName = formData.get('inputPlayerName') as string;
  const selectMap = formData.get('selectMap') as string;

  const header = { "alg": "HS256", "typ": "JWT" };
  const payload = { "playerName": playerName };

  startForm.setAttribute('hidden', '');
  gameControls.removeAttribute('hidden');

  runGame('game-canvas', 'fps-counter');
});

sharebtn.addEventListener('click', function(e){
  e.preventDefault();
  const URL = window.location.href;
  copyToClipboard(URL);
  this.innerHTML = 'URL copied!'
});

function copyToClipboard(text: string) {
  var input = document.body.appendChild(document.createElement("input"));
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('copy');
  input.parentNode.removeChild(input);
}