import { PlayerInfo } from "../src/communication/playerinfo";

/**
 * Mock for GameHUD.
 */
export class GameHUD {
    private tickerCon: HTMLElement;
    private timer: HTMLElement;
    private playerName: HTMLElement;
    private kills: HTMLElement;
    private deaths: HTMLElement;
    private mapName: HTMLElement;
    private respawnCon: HTMLElement;
    private scoreboard: HTMLElement;
    private settings: HTMLElement;
    private socketStatus: HTMLElement;
    private fps: HTMLElement;

    public initializeHud(map: string, player: PlayerInfo) { return; }
    public updatePlayerInfo(playerInfo: PlayerInfo): void  { return; }
    public showMapInfo(map: string): void  { return; }
    public showTicket(msg: string): void  { return; }
    public setTimer(time: BigInt): void  { return; }
    public displayRespawn(isDead: boolean): void  { return; }
    public updateScoreboard(ranking: Array<PlayerInfo>): void  { return; }
    public toggleScoreboard(): void  { return; }
    public toggleFPS(): void  { return; }
    public toggleSettings(): void  { return; }
    public showSocketStatus(msg: string): void  { return; }
}
