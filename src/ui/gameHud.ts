import { PlayerInfo } from "../communication/playerinfo";
import { playSoundEffect } from "../index";

let tickerCon: HTMLElement;
let timer: HTMLElement;
let playerName: HTMLElement;
let kills: HTMLElement;
let deaths: HTMLElement;
let mapName: HTMLElement;
let respawnCon: HTMLElement;
let scoreboard: HTMLElement;
let settings: HTMLElement;
let socketStatus: HTMLElement;
let fps: HTMLElement;

export class GameHUD {
    /***
     * Initialize all Hud HTMLElements
     */
    public initializeHud(map: string, player: PlayerInfo) {
        tickerCon = document.querySelector("#ticker-container");
        timer = document.querySelector("#timer");
        playerName = document.querySelector("#playerName");
        kills = document.querySelector("#kills");
        deaths = document.querySelector("#deaths");
        mapName = document.querySelector("#mapName");
        respawnCon = document.querySelector("#respawn-container");
        scoreboard = document.querySelector("#scoreboard-container");
        settings = document.querySelector("#settings-container");
        socketStatus = document.querySelector("#socket-status");
        fps = document.querySelector("#fps-container");

        this.showMapInfo(map);
        //updatePlayerInfo(player); TODO we need to call this externally when the data is ready!

        document.querySelectorAll(".makes-sound").forEach(item => {
            item.addEventListener("mouseenter", (event) => {
                event.preventDefault();
                playSoundEffect("./assets/audio/menuToggle_1.mp3");
            });
            item.addEventListener("click", (event) => {
                playSoundEffect("./assets/audio/menuEnter_1.mp3");
            });
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
     * Displays Kill Count and Death Count of current Player
     * @param playerInfo Info of the current Player
     */
    public updatePlayerInfo(playerInfo: PlayerInfo): void {
        playerName.innerText = playerInfo.getTruncatedUserName;
        kills.innerText = playerInfo.killCount.toString();
        deaths.innerText = playerInfo.deathCount.toString();
    }

    /**
     * Displays current Map Name and PlayerName
     * @param map Name of the current Map
     */
    public showMapInfo(map: string): void {
        mapName.innerText = map;
    }

    /**
     * Ticker in corner
     * @param msg Message that should be displayed
     */
    public showTicket(msg: string): void {
        const ticker = document.createElement('div');
        ticker.className = "ticker position-fixed p-3";
        ticker.innerText = msg;
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

    // TODO:
    /**
     * Time left until end of round
     * @param 
     */
    public setTimer(): void {
    }

    /**
     * @param isDead 
     */
    public displayRespawn(isDead: boolean): void {
        settings.hidden = true;
        scoreboard.hidden = true;

        if (isDead) {
            respawnCon.hidden = false;
            document.exitPointerLock();
        } else {
            respawnCon.hidden = true;
            document.body.requestPointerLock();
        }
    }

    /**
     * 
     * @param ranking Array of {@link PlayerInfo}
     */
    public updateScoreboard(ranking: Array<PlayerInfo>): void {
        // TODO: Nicer Method
        const table: HTMLElement = scoreboard.querySelector("tbody");
        table.textContent = '';
        for (let index = 0; index < ranking.length; index++) {
            var row = document.createElement("tr");

            const cellRank = document.createElement("td");
            const cellRankText = document.createTextNode((index + 1).toString());
            cellRank.appendChild(cellRankText);
            row.appendChild(cellRank);

            const cellPlayerName = document.createElement("td");
            const cellPlayerNameText = document.createTextNode(ranking[index].getTruncatedUserName);
            cellPlayerName.appendChild(cellPlayerNameText);
            row.appendChild(cellPlayerName);

            const cellKills = document.createElement("td");
            const cellKillsText = document.createTextNode(ranking[index].killCount.toString());
            cellKills.appendChild(cellKillsText);
            row.appendChild(cellKills);

            const cellDeaths = document.createElement("td");
            const cellDeathsText = document.createTextNode(ranking[index].deathCount.toString());
            cellDeaths.appendChild(cellDeathsText);
            row.appendChild(cellDeaths);

            table.appendChild(row);
        }
    }

    /**
     * Show/Hide Scoreboard
     */
    public toggleScoreboard(): void {
        settings.hidden = true;
        scoreboard.hidden = scoreboard.hidden ? false : true;
    }

    /**
     * Show/Hide FPS information
     */
    public toggleFPS(): void {
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
     */
    public toggleSettings(): void {
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
    public showSocketStatus(msg: string): void {
        const statusMsg = document.createElement('span');
        statusMsg.innerText = `${msg}\n`;
        if (typeof process === 'undefined') {
            socketStatus.append(statusMsg);

            setTimeout(function () {
                statusMsg.remove();
            }, 5000);

        }
    }

}
