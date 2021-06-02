import { Vec2D } from "../common/vec2d";
import { Player } from "../player/player";
import { Enemy } from "../entities/enemy";
import { OpCode } from "./opcode";
import { Packet } from "./packet";
import { PlayerInfo } from "./playerinfo";
import { GameHUD } from "../ui/gameHud";
import { StringHelper } from "../common/stringhelper";
import { LogicHelper } from "../logic/logichelper";

/**
 * Class Purpose:
 * Packet -> Game Logic
 * Given a packet, generate gamelogic that should result from whatever the packet tells us.
 * 
 * Example: Server generated a MOVEMENT packet. Thus, we want to update the
 * movements of an enemy because he's evidently moved.
 */
export class PacketToGameLogic {
    /**
     * Current player instance
     */
    private player: Player;

    /**
     * Map of all enemies (other players), mapped from userID to PlayerInfo instance.
     */
    private enemyMap: Map<number, Enemy>;

    /** 
      * Instance of the game hud
      */
    private gameHUD: GameHUD;

    /**
      * The ID of the current map
      */
    private currentMapID: number;

    /**
      * Timer for map change
      */
    private currentTime: BigInt;

    /**
     * 
     * @param {Player} player - Player reference
     */
    constructor(player: Player, gameHUD: any) {
        this.player = player;
        this.enemyMap = new Map<number, Enemy>();
        this.gameHUD = gameHUD;
    }

    /**
     * Generate gameplay actions through packets received from the server.
     * 
     * @param {Packet} pkt - the parsed packet received from the server.
     */
    public handlePacket(pkt: Packet) {
        switch (pkt.opCode) {
            case OpCode.SERVER_PLAYERDEATH:
                this.playerDeath(pkt.killerID, pkt.victimID);
                this.updateRanking();
                break;
            case OpCode.SERVER_DISCONNECT:
                this.gameHUD.showTicket("Server has disconnected!");
                LogicHelper.exitGame();
                break;
            case OpCode.SERVER_UNKNOWN:
                this.gameHUD.showTicket("Server has sent unknown message");
                break;
            case OpCode.SERVER_MOVEMENT:
                this.movement(pkt);
                break;
            case OpCode.SERVER_YOUARECALLED:
                this.player.getPlayerInfo.userID = pkt.userID;
                this.gameHUD.updatePlayerInfo(this.player.getPlayerInfo);
                this.updateRanking();
                break;
            case OpCode.SERVER_PLAYERJOINED:
                this.addEnemy(pkt.userID, new PlayerInfo({ userID: pkt.userID, userName: pkt.name, killCount: 0, deathCount: 0 }))
                this.gameHUD.showTicket(`${StringHelper.truncateString(pkt.name, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH)} has joined`);
                this.updateRanking();
                break;
            case OpCode.SERVER_PLAYERLEFT:
                this.gameHUD.showTicket(`${StringHelper.truncateString(this.enemyMap.get(pkt.userID).getPlayerInfo.getUserName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH)} has left`);
                this.removeEnemy(pkt.userID);
                this.updateRanking();
                break;
            case OpCode.SERVER_SENDALLPLAYERINFO:
                this.synchronizeEnemyList(pkt.playerInfoList);
                this.updateRanking();
                break;
            case OpCode.SERVER_SENDALLPLAYERKD:
                this.synchronizeEnemyList(pkt.playerKillDeathList);
                this.updateRanking();
                break;
            case OpCode.SERVER_TELEPORT:
                this.teleport(pkt);
                break;
            case OpCode.SERVER_SHOOTING:
                this.enemyMap.get(pkt.userID).shoot(this.player.getPosition);
                break;
            case OpCode.SERVER_MAPCHANGE:
                this.gameHUD.setTimer(pkt.time);
                this.currentMapID = pkt.mapID;
                this.currentTime = pkt.time;
                break;
            default:
                break;
        }
    }

    /**
     * Updates Player or Enemy information.
     * @param {PlayerInfo} playerInfoOld - Old {@link PlayerInfo} to be processed.
     * @param {PlayerInfo} playerInfoNew - New {@link PlayerInfo} to be processed.
     */
    private updatePlayerInfo(playerInfoOld: PlayerInfo, playerInfoNew: PlayerInfo) {
        if (playerInfoNew.deathCount) {
            playerInfoOld.deathCount = playerInfoNew.deathCount;
        }
        if (playerInfoNew.killCount) {
            playerInfoOld.killCount = playerInfoNew.killCount;
        }
        if (playerInfoNew.getUserName) {
            playerInfoOld.setUserName = playerInfoNew.getUserName;
        }
        if (playerInfoNew.isDead) {
            playerInfoOld.isDead = playerInfoNew.isDead;
        }
    }

    /**
     * Synchronises the {@link enemyMap} with joining or leaving {@link Enemy} instances.
     * @param list Array of {@link PlayerInfo} to be processed.
     */
    private synchronizeEnemyList(list: Array<PlayerInfo>) {
        for (let index = 0; index < list.length; index++) {
            let userID = list[index].userID;
            if (this.enemyMap.has(userID)) {
                this.updatePlayerInfo(this.enemyMap.get(userID).getPlayerInfo, list[index]);
            } else {
                this.addEnemy(userID, list[index]);
            }
        }
    }

    /**
     * Removes an {@link Enemy} from the map.
     * @param {number} userID - ID of the {@link Enemy} to be removed.
     */
    private removeEnemy(userID: number) {
        if (this.enemyMap.has(userID)) {
            this.enemyMap.delete(userID);
        }
    }

    /**
     * Adds an {@link Enemy} to the map.
     * @param {number} userID - ID of the {@link Enemy} to be added.
     * @param {PlayerInfo} playerInfo - {@link PlayerInfo} instance containing all information of {@link Enemy}.
     */
    private addEnemy(userID: number, playerInfo: PlayerInfo) {
        let enemyToAdd = new Enemy();
        enemyToAdd.setPlayerInfo = playerInfo;
        this.enemyMap.set(userID, enemyToAdd);
    }

    /**
     * Handles death of player or enemy and prepares info for the on-screen kill feed.
     * @param {number} killerID - Who has defeated an {@link Player} or {@link Enemy}.
     * @param {number} victimID - {@link Player} or {@link Enemy} who has been defeated.
     */
    private playerDeath(killerID: number, victimID: number) {
        let killerName = "";
        let victimName = "";
        const playerID = this.player.getPlayerInfo.userID

        // Has player been defeated?
        if (victimID === playerID) {
            // Kill player
            this.player.setDead(true);
            this.player.getPlayerInfo.deathCount++;
            this.enemyMap.get(killerID).getPlayerInfo.killCount++;

            // Update HUD
            this.gameHUD.displayRespawn(true);
            this.gameHUD.updatePlayerInfo(this.player.getPlayerInfo);

            // Prepare ticket on screen
            killerName = this.enemyMap.get(killerID).getPlayerInfo.getUserName;
            killerName = StringHelper.truncateString(killerName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            victimName = this.player.getPlayerInfo.getUserName;
            victimName = StringHelper.truncateString(victimName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            
        } 
        
        // Has an enemy defeated another enemy?
        else if (victimID !== playerID && killerID !== playerID) {
            // Fallback to prevent crash if victim or killer isn't present in client-internal enemy map
            if (!this.enemyMap.has(victimID) || this.enemyMap.get(victimID).getPlayerInfo == undefined) /* ||
            !this.enemyMap.has(killerID) || this.enemyMap.get(killerID).getPlayerInfo == undefined)*/ {
                console.error("Tried to get id " + victimID + "but was not present in enemy map!");
                return;
            }

            // Prepare killer and victim info. 
            const killerInfo = this.enemyMap.get(killerID);
            const victimInfo = this.enemyMap.get(victimID);

            // Has an enemy defeated another enemy?
            // Kill enemy
            victimInfo.getPlayerInfo.isDead = true;
            victimInfo.getPlayerInfo.deathCount++;
            killerInfo.getPlayerInfo.killCount++;
            
            // Failsafe. Prevents crash for undefined victim & killer ID and prepares the ticket message
            if(killerInfo && victimInfo) {
                killerName = killerInfo.getPlayerInfo.getUserName;
                killerName = StringHelper.truncateString(killerName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
                victimName = victimInfo.getPlayerInfo.getUserName;
                victimName = StringHelper.truncateString(victimName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            }
        }
        
        // Has player killed an enemy?
        else if (killerID === this.player.getPlayerInfo.userID) {
            // Increment player kill count
            this.player.getPlayerInfo.killCount++;
            this.enemyMap.get(victimID).getPlayerInfo.deathCount++;

            // kill enemy
            this.enemyMap.get(victimID).getPlayerInfo.isDead = true;

            // Update HUD
            this.gameHUD.updatePlayerInfo(this.player.getPlayerInfo);
            
            // Prepare ticket on screen
            killerName = this.player.getPlayerInfo.getUserName;
            killerName = StringHelper.truncateString(killerName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            victimName = this.enemyMap.get(victimID).getPlayerInfo.getUserName;
            victimName = StringHelper.truncateString(victimName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
        }

        // Show ticket on screen
        this.gameHUD.showTicket(`${killerName} ${StringHelper.randomKillVerb()} ${victimName}`);
    }

    /**
     * Handles movement
     * @param {Packet} pkt - Packet received from the server.
     */
    private movement(pkt: Packet) {
        this.enemyMap.get(pkt.userID).setPosition = new Vec2D(pkt.coorX, pkt.coorY);
        this.enemyMap.get(pkt.userID).setAngle = pkt.angle;
        this.enemyMap.get(pkt.userID).walk();
        this.enemyMap.get(pkt.userID).updateDistanceToPlayer(this.player.getPosition);
    }

    /**
     * Handles teleportation, as well as respawning.
     * @param {Packet} pkt - Packet received from the server.
     */
    private teleport(pkt: Packet) {
        const newPosition = new Vec2D(pkt.coorX, pkt.coorY);
        if (pkt.userID === this.player.getPlayerInfo.userID) {
            this.gameHUD.displayRespawn(false);
            // If player gets teleported (also happening when spawning), set player not not dead.
            this.player.setDead(false);
            // Transport player to new position.
            this.player.setPosition = newPosition;
        } else {
            this.enemyMap.get(pkt.userID).setPosition = newPosition;
            this.enemyMap.get(pkt.userID).getPlayerInfo.isDead = false;
        }
    }

    /**
     * Updates the Ranking of all players
     */
     private updateRanking() {
        let ranking = this.getEnemies;
        ranking.push(this.player);
        ranking.sort((a, b) => (b.getPlayerInfo.killCount-b.getPlayerInfo.deathCount) - (a.getPlayerInfo.killCount-a.getPlayerInfo.deathCount));
        this.gameHUD.updateScoreboard(ranking, ranking.indexOf(this.player) + 1);
    }

    /**
     * Getter for enemies currently occupying the map according to the server
     */
    public get getEnemies(): any[] {
        return Array.from(this.enemyMap.values());
    }

    /**
     * Getter for current time (purpose: when map change happens)
     */
    public get getCurrentTime(): BigInt {
        return this.currentTime;
    }

    /**
     * Getter for the current map id
     */
    public get getCurrentMapID(): number {
        return this.currentMapID;
    }
}
