import { initializeLandingPage } from "./landingpage";

/**
 * load the html for the StartMenu
 */
loadPage("html/startMenu.html");
initializeLandingPage();

/**
 * Loads Page
 * @param href Path to the HTML
 */
export function loadPage(href: string): void {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    document.getElementById('content').innerHTML = xmlhttp.responseText;
}

/**
 * Something happend, alert the player 
 * and reload the page (redirect to landingPage)
 * @param msg Error message to display
 */
 export function showAlert(msg: string): void {
    loadPage("html/error.html");
    document.getElementById("error-msg").innerText = msg;
    document.exitPointerLock();
    document.querySelector("#redirectbtn").addEventListener("click", function (event) {
        event.preventDefault();
        playSoundEffect("./assets/audio/menuEnter_1.mp3");
        location.reload(); 
    });
}

/**
 * Plays soundeffect
 * @param audioPath Soundeffect that should be played
 */
 export function playSoundEffect(audioPath: string): void {
    const soundEffect: HTMLAudioElement = new Audio(audioPath);
    soundEffect.volume = 0.1;
    (<HTMLAudioElement>soundEffect.cloneNode()).play();
}
