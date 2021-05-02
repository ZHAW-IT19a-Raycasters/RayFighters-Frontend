const liveTicker: HTMLElement = document.querySelector("#ticker-container");
const timer: HTMLElement = document.querySelector("#timer");
const healthBar: HTMLElement = document.querySelector("#health");
const playerName: HTMLElement = document.querySelector("#playerName");
const mapName: HTMLElement = document.querySelector("#mapName");

/**
 * Displays current health of Player
 * @param health
 */
 function updateHealth(health: string): void {
    healthBar.innerText = health;
}

/**
 * Displays current Map Name and PlayerName
 * @param 
 */
 function showGameInfo(map: string, player: string): void {
    mapName.innerText = map;
    playerName.innerText = player;
}

/**
 * Ticker in corner
 * @param showMsg Message to display
 */
 function showTicket(showMsg: string): void {
    liveTicker.hidden = false;
    liveTicker.innerText = showMsg;
}

/**
 * Time left until end of round
 * @param 
 */
 function setTimer(): void {
}