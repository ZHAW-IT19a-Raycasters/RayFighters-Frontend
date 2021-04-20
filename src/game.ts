import { Controls } from './controls';
import { GameLoop } from './gameloop';
import { OpCode, Packet } from './packet';
import { Player } from './player';
import { Image2D, Renderer } from './renderer';
import { Room } from './room';
import { Weapon } from './weapon';

/**
 * Runs the Game
 * @param canvasName Id of the Canvas HTMLElement
 * @param fpsCounterName Id of the FPS Counter HTMLElement
  */
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
    sendCallback(new Packet({ opCode: OpCode.CLIENT_UNKNOWN }));
    receivedPackets.forEach(p => {
      console.log(p.opCode)
    })
  });
}

const startForm: HTMLFormElement = document.querySelector("#startGameForm");
const gameControls: HTMLDivElement = document.querySelector("#gameControls");
const aboutProject: HTMLDivElement = document.querySelector("#aboutProject");
const outputTextAudio: HTMLAudioElement = new Audio("./assets/audio/outputText_1.mp3");

/**
 * Eventlistener of the "Start Game" Start-Menu option
 * On click: starts the game and requests a JWT
 * @param e Event that gets passed from the listener.
 */
startForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(startForm);

  const playerName = formData.get("inputPlayerName") as string;
  const selectMap = formData.get("selectMap") as string;

  const content = { "username": playerName };

  //getJWT(content);

  startForm.hidden = true;
  gameControls.hidden = false;

  runGame("game-canvas", "fps-counter");
});

/**
 * Eventlistener
 * Plays soundeffect
 * @param e Event that gets passed from the listener.
 */
document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("mouseenter", (event) => {
    event.preventDefault();

    const menuToggleAudio: HTMLAudioElement = new Audio("./assets/audio/menuToggle_1.mp3");
    menuToggleAudio.volume = 0.2;
    (<HTMLAudioElement>menuToggleAudio.cloneNode()).play();
  });
});

/**
 * Eventlistener of the "About Game" Start-Menu option
 * On click: shows the credits.
 * @param e Event that gets passed from the listener.
 */
document.querySelector("#aboutbtn").addEventListener("click", function (e) {
  e.preventDefault();

  startForm.hidden = true;
  aboutProject.hidden = false;

  const credits =
    "CREDITS\nThis\u00A0awesome\u00A0game\u00A0was\u00A0created\u00A0as\u00A0a\u00A0software\u00A0project\u00A0at\u00A0the\u00A0Zürcher\u00A0Hochschule\u00A0für\nAngewandte\u00A0Wissenschaften.";
  outputTextAudio.volume = 0.1;
  outputTextAudio.play();
  outputTextAudio.loop = true;

  showText(aboutProject.querySelector("p"), aboutProject, credits, 0);
});

/**
 * Eventlistener of the "go back" to menu button
 * On click: goes back to the loading page Start-Menu
 * @param e Event that gets passed from the listener.
 */
document.querySelector("#backbtn").addEventListener("click", function (e) {
  e.preventDefault();

  aboutProject.hidden = true;
  startForm.hidden = false;
});

/**
 * Eventlistener of the "Share with Friends" Start-Menu option
 * On click: copies URL to Clipboard
 * @param e Event that gets passed from the listener.
 */
document.querySelector("#sharebtn").addEventListener("click", function (e) {
  e.preventDefault();
  
  const URL = window.location.href;
  copyToClipboard(URL);
  this.innerHTML = "URL copied!";
});

/**
 * Copies a Text into the Clipboard.
 * @param text Text that to copy into the clipboard.
 */
function copyToClipboard(text: string): void {
  var input = document.body.appendChild(document.createElement("input"));
  input.value = text;
  input.focus();
  input.select();
  document.execCommand("copy");
  input.parentNode.removeChild(input);
}

/**
 * Display a Text in an 80's style, letter by letter.
 * @param target Where to display the text
 * @param parent Parent Element of target
 * @param message Text to display
 * @param index Index of char that should be displayed next
 */
function showText(
  target: HTMLElement,
  parent: HTMLElement,
  message: string,
  index: number
): void {
  if (parent.hidden) {
    target.innerText = "";
    outputTextAudio.pause();
    return;
  }
  if (index < message.length) {
    target.innerText += message[index];
    index++;
    setTimeout(function () {
      showText(target, parent, message, index);
    }, 80);
  } else {
    outputTextAudio.pause();
  }
}
