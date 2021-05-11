import { playSoundEffect, showAlert } from ".";

let tickerCon: HTMLElement;
let timer: HTMLElement;
let healthBar: HTMLElement;
let kills: HTMLElement;
let deaths: HTMLElement;
let playerName: HTMLElement;
let mapName: HTMLElement;
let respawnCon: HTMLElement;
let scoreboard: HTMLElement;
let settings: HTMLElement;
let socketStatus: HTMLElement;
let fps: HTMLElement;

/***
 * Initialize all Hud HTMLElements
 */
export function initializeHud(map: string, player: string) {
    tickerCon = document.querySelector("#ticker-container");
    timer = document.querySelector("#timer");
    healthBar = document.querySelector("#health");
    playerName = document.querySelector("#playerName");
    mapName = document.querySelector("#mapName");
    respawnCon = document.querySelector("#respawn-container");
    scoreboard = document.querySelector("#scoreboard-container");
    settings = document.querySelector("#settings-container");
    socketStatus = document.querySelector("#socket-status");
    fps = document.querySelector("#fps-container");
    showGameInfo(map, player);

    document.querySelectorAll(".makes-sound").forEach(item => {
        item.addEventListener("mouseenter", (event) => {
            event.preventDefault();
            playSoundEffect("./assets/audio/menuToggle_1.mp3");
        });
        item.addEventListener("click", (event) => {
            playSoundEffect("./assets/audio/menuEnter_1.mp3");
        });
    });

    document.querySelector("#respawnbtn").addEventListener("click", function (event) {
        event.preventDefault();
        respawn();
    });

    document.querySelector("#audio-setting").addEventListener("change", function (event) {
        event.preventDefault();
        // Todo: Change Audio Volume
        console.log(this.value);
    });

    document.querySelector("#redirectbtn").addEventListener("click", function (event) {
        event.preventDefault();
        location.reload();
    });
}

/**
 * Displays Kill Count of current Player
 * @param killnr numbr of kills
 */
export function updateKillCount(killnr: number): void {
    kills.innerText = killnr.toString();
}

/**
 * Displays Death Count of current Player
 * @param deathnr number of deaths
 */
export function updateDeathCount(deathnr: number): void {
    deaths.innerText = deathnr.toString();
}

/**
 * Displays current health of Player
 * @param health
 */
export function updateHealth(health: number): void {
    healthBar.innerText = health.toString();
}

/**
 * Displays current Map Name and PlayerName
 * @param map Name of the current Map
 * @param player Name of the current Player
 */
export function showGameInfo(map: string, player: string): void {
    mapName.innerText = map;
    playerName.innerText = player;
}

/**
 * Ticker in corner
 * @param killer Player that got the kill
 * @param victim Player that was killed
 */
export function showTicket(killer: string, victim: string): void {
    const ticker = document.createElement('div');
    ticker.className = "ticker position-fixed p-3";
    ticker.innerText = `${killer} killed ${victim}`;
    tickerCon.append(ticker);
    ticker.style.transition = "margin 0.5s ease-in-out";
    ticker.style.margin = "0px";
    ticker.style.visibility = "visible";

    setTimeout(function () {
        ticker.style.transition = "margin 0.5s ease-in-out, visibility 0s ease-in-out 0.5s";
        ticker.style.margin = "-5em 0px 0px 0px";
        ticker.style.visibility = "hidden";
        ticker.addEventListener("transitionend", () => {
            ticker.remove();
        })
    }, 2000);
}

/**
 * Time left until end of round
 * @param 
 */
export function setTimer(): void {
}

/**
 * 
 * @param 
 */
export function ondeath(): void {
    settings.hidden = true;
    scoreboard.hidden = true;
    respawnCon.hidden = false;
    document.exitPointerLock();
}

/**
 * 
 */
export function respawn(): void {
    respawnCon.hidden = true;
    document.body.requestPointerLock();
}

/**
 * 
 * @param 
 */
export function updateScoreboard(PlayerList: any): void {
    const table: HTMLElement = scoreboard.querySelector("tbody");
    table.textContent = '';
    PlayerList.forEach(function (player: any, rank: string) {
        var row = document.createElement("tr");

        // TODO: in a loop
        var cell = document.createElement("td");
        var cellText = document.createTextNode(rank);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(player.playerName);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(player.kills);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(player.deaths);
        cell.appendChild(cellText);
        row.appendChild(cell);

        table.appendChild(row);
    });
}

/**
 * Show/Hide Scoreboard 
 */
export function toggleScoreboard(): void {
    settings.hidden = true;
    scoreboard.hidden = scoreboard.hidden ? false : true;
}

/**
 * Show/Hide FPS information
 */
export function toggleFPS(): void {
    if (fps.style.visibility == "hidden") {
        fps.style.transition = "margin 0.5s ease-in-out";
        fps.style.visibility = "visible";
        fps.style.margin = "0px";
    } else {
        fps.style.transition = "margin 0.5s ease-in-out, visibility 0s ease-in-out 0.5s";
        fps.style.margin = "-5em 0px 0px 0px";
        fps.style.visibility = "hidden";
    }
}

/**
 * 
 * @param 
 */
export function toggleSettings(): void {
    scoreboard.hidden = true;
    if (settings.hidden) {
        settings.hidden = false;
        document.exitPointerLock();
    } else {
        settings.hidden = true;
        document.body.requestPointerLock();
    }
}

/**
 * 
 * @param msg
 */
export function showSocketStatus(msg: string): void {
    const statusMsg = document.createElement('span');
    statusMsg.innerText = `${msg}\n`;
    socketStatus.append(statusMsg);

    setTimeout(function () {
        statusMsg.remove();
    }, 5000);
}
