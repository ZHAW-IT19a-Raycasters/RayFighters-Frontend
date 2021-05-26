import { playSoundEffect, loadPage } from "../index";
import { runGame } from "../logic/game";
import { GameHUD } from "../ui/gameHud";

/**
 * Register all Evenlisteners for the Startmenu
 */
export function initializeLandingPage(): void {

    const startTab: HTMLFormElement = document.querySelector("#logInForm");
    const aboutTab: HTMLElement = document.querySelector("#aboutTab");
    const menuFooter: HTMLElement = document.querySelector("#menuFooter");
    const backgroundMusic: HTMLAudioElement = new Audio("./assets/audio/menuMusic_1.mp3");

    backgroundMusic.volume = 0.25;
    backgroundMusic.loop = true;
    backgroundMusic.play();

    startTab.addEventListener("submit", function (event) {
        event.preventDefault();
        backgroundMusic.pause()
        handleLogIn(this);
    });
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("mouseenter", (event) => {
            event.preventDefault();
            playSoundEffect("./assets/audio/menuToggle_1.mp3");
        });
        item.addEventListener("click", (event) => {
            playSoundEffect("./assets/audio/menuEnter_1.mp3");
        });
    });
    document.querySelector("#aboutbtn").addEventListener("click", function (event) {
        event.preventDefault();
        menuFooter.hidden = true;
        ToggleMenuTab(startTab, aboutTab);
        const credits =
            "CREDITS\nThis\u00A0awesome\u00A0game\u00A0was\u00A0created\nas\u00A0a\u00A0software\u00A0project\nat\u00A0ZHAW.";
        const outputTextAudio: HTMLAudioElement = new Audio("./assets/audio/outputText_1.mp3");
        outputTextAudio.volume = 0.1;
        outputTextAudio.loop = true;
        outputTextAudio.play();
        displayTextStyled(aboutTab.querySelector("p"), aboutTab, outputTextAudio, credits, 0);
    });
    document.querySelector("#backbtn").addEventListener("click", function (event) {
        event.preventDefault();
        menuFooter.hidden = false;
        ToggleMenuTab(aboutTab, startTab);
    });
    document.querySelector("#sharebtn").addEventListener("click", function (event) {
        event.preventDefault();
        urlToClipboard();
        this.innerHTML = "URL copied!";
    });
    document.querySelector("#mutebtn").addEventListener("click", function (event) {
        event.preventDefault();
        toggleBackMusic(this, backgroundMusic);
    });
}

/**
 * Retreives a JSON authetication token.
 */
function getJWT(content: any): void {
    let JSONcontent = JSON.stringify(content)
    const xhttp = new XMLHttpRequest();
    // force browser to send cookies
    xhttp.withCredentials = true

    // Retreive JWT token
    if(window.location.host === 'localhost:9000' || window.location.host === '127.0.0.1:9000') {
        // Development environment
        xhttp.open("POST", "http://127.0.0.1:8080/auth", false);
    } else {
        // Production environment
        xhttp.open("POST", "/server/auth", false);
    }

    // Connecting to server
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSONcontent);

    if (xhttp.status != 200) {
        alert("Error authenticating to the server!");
    }
}

/**
 * Starts the game and requests a JWT
 * @param {HTMLFormElement} form
 */
function handleLogIn(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const playerName = formData.get("inputPlayerName") as string;

    // Save to local storage
    if (typeof(Storage) !== 'undefined') {
        // Store
        localStorage.setItem('name', playerName);
    }

    const content = { "username": playerName };

    getJWT(content);

    const overlayEffect: HTMLElement = document.querySelector("#overlay-effect");
    overlayEffect.remove();

    const landingpageVideo: HTMLElement = document.querySelector("#video");
    landingpageVideo.remove();

    //load the html for the Game
    loadPage('html/game.html');

    // Instantiate HUD
    const gameHUD = new GameHUD();

    // run the Game
    runGame("game-canvas", "fps-counter", gameHUD);
}

/**
 * Mute/Unmute Background Music
 *  @param backgroundMusic Musik
 *  @param icon Mute/Unmute HTMLElement
 */
function toggleBackMusic(icon: any, backgroundMusic: HTMLAudioElement): void {
    if (backgroundMusic.muted) {
        backgroundMusic.muted = false;
        icon.innerHTML = '<h5><i class="bi bi-volume-up"></i></h5>';
    } else {
        backgroundMusic.muted = true;
        icon.innerHTML = '<h5><i class="bi bi-volume-mute"></i></h5>';
    }
}

/**
 * Loads the wanted Start-Menu Tab
 * @param hideElement Start-Menu Tab to hide
 * @param showElement Start-Menu Tab to display
 */
function ToggleMenuTab(hideElement: any, showElement: any): void {
    hideElement.hidden = true;
    showElement.hidden = false;
}

/**
 * Copies URL to Clipboard
 */
function urlToClipboard(): void {
    var input = document.body.appendChild(document.createElement("input"));
    input.value = window.location.href;
    input.focus();
    input.select();
    document.execCommand("copy");
    input.parentNode.removeChild(input);
}

/**
 * Display a Text in an 80's style, letter by letter.
 * @param target Where to display the text
 * @param parent Parent Element of target
 * @param soundEffect Soundeffect that should be played
 * @param message Text to display
 * @param index Index of char that should be displayed next
 */
function displayTextStyled(
    target: HTMLElement,
    parent: HTMLElement,
    soundEffect: HTMLAudioElement,
    message: string,
    index: number
): void {
    if (parent.hidden) {
        target.innerText = "";
        soundEffect.pause();
        return;
    }
    if (index < message.length) {
        target.innerText += message[index];
        index++;
        setTimeout(function () {
            displayTextStyled(target, parent, soundEffect, message, index);
        }, 20);
    } else {
        soundEffect.pause();
    }
}
