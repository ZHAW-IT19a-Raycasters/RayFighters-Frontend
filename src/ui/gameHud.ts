import { StringHelper } from "../common/stringhelper";
import { PlayerInfo } from "../communication/playerinfo";
import { playSoundEffect } from "../index";

export class GameHUD {
    private static readonly SEC_TO_NANOSEC_FACTOR = BigInt(1_000_000_000);
    private static readonly SEC_TO_MILLISEC_FACTOR = 1_000;
    private static readonly ROUND_TIME_SEC = 5 * 60; 
    private tickerCon: HTMLElement;
    private timer: HTMLElement;
    /*
     * unix timestamp when the map shall change
     */
    private timerValue: number;
    private playerName: HTMLElement;
    private kills: HTMLElement;
    private deaths: HTMLElement;
    private mapName: HTMLElement;
    private respawnCon: HTMLElement;
    private scoreboard: HTMLElement;
    private settings: HTMLElement;
    private socketStatus: HTMLElement;
    private fps: HTMLElement;
    private debug: HTMLElement;

    constructor() { /* Deliberately empty */ }
    /***
     * Initialize all Hud HTMLElements
     */
    public initializeHud(map: string, player: PlayerInfo) {
        this.tickerCon = document.querySelector("#ticker-container");
        this.timer = document.querySelector("#timer");
        this.playerName = document.querySelector("#playerName");
        this.kills = document.querySelector("#kills");
        this.deaths = document.querySelector("#deaths");
        this.mapName = document.querySelector("#mapName");
        this.respawnCon = document.querySelector("#respawn-container");
        this.scoreboard = document.querySelector("#scoreboard-container");
        this.settings = document.querySelector("#settings-container");
        this.socketStatus = document.querySelector("#socket-status");
        this.fps = document.querySelector("#fps-container");
        this.debug = document.querySelector("#debug-container");

        // Don't display debug window for now (REMOVE FOR DEBUGGIN PURPOSES)
        this.debug.style.display = 'none';

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
        this.playerName.innerText = playerInfo.getTruncatedUserName;
        this.kills.innerText = playerInfo.killCount.toString();
        this.deaths.innerText = playerInfo.deathCount.toString();
    }

    /**
     * Displays current Map Name and PlayerName
     * @param map Name of the current Map
     */
    public showMapInfo(map: string): void {
        this.mapName.innerText = map;
    }

    /**
     * Ticker in corner
     * @param msg Message that should be displayed
     */
    public showTicket(msg: string): void {
        const ticker = document.createElement('div');
        ticker.className = "ticker position-fixed p-3";
        ticker.innerText = msg;
        this.tickerCon.append(ticker);
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
     * @param time UNIX timestamp
     */
    public setTimer(time: BigInt): void {
        const timeBI = BigInt(time);
        this.timerValue = Number(timeBI / GameHUD.SEC_TO_NANOSEC_FACTOR);
    }

    public updateTimer(): void {
        const timeLeft = (this.timerValue - (Date.now() / GameHUD.SEC_TO_MILLISEC_FACTOR));
        const diff =  GameHUD.ROUND_TIME_SEC + timeLeft;
        const mins = Math.floor(diff / 60);
        const secs = Math.floor(diff % 60);
        // It's possible for mins/secs to be negative (game is still loading new
        // map, so we just skip displaying that).
        if(mins >= 0 && secs >= 0) {
            const minsPadded = StringHelper.padLeadingZeros(mins, 2);
            const secsPadded = StringHelper.padLeadingZeros(secs, 2);
            this.timer.innerText = `${minsPadded}:${secsPadded}`;
        }
        if(mins == 0 && secs <= 5) {
            this.showTicket('Round over. Changing map...');
        }
    }

    /**
     * @param isDead 
     */
    public displayRespawn(isDead: boolean): void {
        this.settings.hidden = true;
        this.scoreboard.hidden = true;

        if (isDead) {
            this.respawnCon.hidden = false;
            document.exitPointerLock();
        } else {
            this.respawnCon.hidden = true;
            if(document.body.requestPointerLock) {
                // Not mobile
                document.body.requestPointerLock();
            }
        }
    }

    /**
     * 
     * @param ranking Array of {@link PlayerInfo}
     */
    public updateScoreboard(ranking: Array<PlayerInfo>): void {
        // TODO: Nicer Method
        const table: HTMLElement = this.scoreboard.querySelector("tbody");
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
        this.settings.hidden = true;
        this.scoreboard.hidden = this.scoreboard.hidden ? false : true;
    }

    /**
     * Show/Hide FPS information
     */
    public toggleFPS(): void {
        if (this.fps.style.visibility == "hidden") {
            this.fps.style.transition = "margin 0.5s ease-in-out";
            this.fps.style.visibility = "visible";
            this.fps.style.margin = "0px";
        } else {
            this.fps.style.transition = "margin 0.5s ease-in-out, visibility 0s ease-in-out 0.5s";
            this.fps.style.margin = "-5em 0px 0px 0px";
            this.fps.style.visibility = "hidden";
        }
    }

    /**
     * 
     */
    public toggleSettings(): void {
        this.scoreboard.hidden = true;
        if (this.settings.hidden) {
            this.settings.hidden = false;
            document.exitPointerLock();
        } else {
            this.settings.hidden = true;
            if(document.body.requestPointerLock) {
                // Not mobile
                document.body.requestPointerLock();
            }
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
            this.socketStatus.append(statusMsg);

            setTimeout(function () {
                statusMsg.remove();
            }, 5000);

        }
    }

}