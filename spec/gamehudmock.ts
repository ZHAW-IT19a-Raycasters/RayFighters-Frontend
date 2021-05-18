import { PlayerInfo } from "../src/communication/playerinfo";

/**
 * Mock for GameHUD.
 */
export class GameHUD {
    public initializeHud(map: string, player: PlayerInfo) { return; }
    public updatePlayerInfo(playerInfo: PlayerInfo): void  { return; }
    public showMapInfo(map: string): void  { return; }
    public showTicket(msg: string): void  { return; }
    public setTimer(): void  { return; }
    public displayRespawn(isDead: boolean): void  { return; }
    public updateScoreboard(ranking: Array<PlayerInfo>): void  { return; }
    public toggleScoreboard(): void  { return; }
    public toggleFPS(): void  { return; }
    public toggleSettings(): void  { return; }
    public showSocketStatus(msg: string): void  { return; }
}
