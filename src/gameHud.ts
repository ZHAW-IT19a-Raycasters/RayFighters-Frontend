/**
 * HUD class
 */
export class gameHud {
    private liveTicker: HTMLElement;
    private timer: HTMLElement;
    private healthBar: HTMLElement;
    private kills: HTMLElement;
    private deaths: HTMLElement;
    private playerName: HTMLElement;
    private mapName: HTMLElement;
    private respawnCon: HTMLElement;

    /***
     * @constructor
     */
    constructor(map: string, player: string) {
        this.liveTicker = document.querySelector("#ticker-container");
        this.timer = document.querySelector("#timer");
        this.healthBar = document.querySelector("#health");
        this.playerName = document.querySelector("#playerName");
        this.mapName = document.querySelector("#mapName");
        this.respawnCon = document.querySelector("#respawn-container")
        this.showGameInfo(map, player);
    }
    
    /**
     * Displays Kill Count of current Player
     * @param killnr numbr of kills
     */
     public updateKillCount(killnr: string): void {
        this.kills.innerText = killnr;
    }

    /**
     * Displays Death Count of current Player
     * @param deathnr number of deaths
     */
     public updateDeathCount(deathnr: string): void {
        this.deaths.innerText = deathnr;
    }

    /**
     * Displays current health of Player
     * @param health
     */
    public updateHealth(health: string): void {
        this.healthBar.innerText = health;
    }

    /**
     * Displays current Map Name and PlayerName
     * @param map Name of the current Map
     * @param player Name of the current Player
     */
    public showGameInfo(map: string, player: string): void {
        this.mapName.innerText = map;
        this.playerName.innerText = player;
    }

    /**
     * Ticker in corner
     * @param showMsg Message to display
     */
    public showTicket(showMsg: string): void {
        this.liveTicker.hidden = false;
        this.liveTicker.innerText = showMsg;
    }

    /**
     * Time left until end of round
     * @param 
     */
    public setTimer(): void {
    }

    /**
     * 
     * @param 
     */
     public ondeath(): void {
        this.respawnCon.hidden = false;
    }

    /**
     * 
     * @param 
     */
    public respawn(): void {
        this.respawnCon.hidden = true;
}

}