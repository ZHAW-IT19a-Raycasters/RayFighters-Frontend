import { Vec2D } from "../common/vec2d";
import { Player } from "../player/player";
import { Enemy } from "../entities/enemy";
import { OpCode } from "./opcode";
import { Packet } from "./packet";
import { PlayerInfo } from "./playerinfo";
import { displayRespawn, showTicket, updatePlayerInfo, updateScoreboard } from "../gameHud";
import { loadPage } from "../index";
import { StringHelper } from "../common/stringhelper";

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
    private player: Player

    /**
     * Map of all enemies (other players), mapped from userID to PlayerInfo instance.
     */
    private enemyMap: Map<number, Enemy>;

    /**
     * 
     * @param player Player reference
     */
    constructor(player: Player) {
        this.player = player;
        this.enemyMap = new Map<number, Enemy>();
    }

    /**
     * Generate gameplay actions through packets received from the server.
     * 
     * @param p the parsed packet received from the server.
     */
    public handlePacket(p: Packet) {
        switch (p.opCode) {
            case OpCode.SERVER_PLAYERDEATH:
                this.playerDeath(p.killerID, p.victimID);
                break;
            case OpCode.SERVER_DISCONNECT:
                alert("Server has disconnected!");
                this.cancelGame();
                break;
            case OpCode.SERVER_UNKNOWN:
                alert("Server has sent unknown message");
                break;
            case OpCode.SERVER_MOVEMENT:
                this.movement(p);
                break;
            case OpCode.SERVER_YOUARECALLED:
                console.log("Your ID is: " + p.userID);
                this.player.getPlayerInfo.userID = p.userID;
                updatePlayerInfo(this.player.getPlayerInfo);
                break;
            case OpCode.SERVER_PLAYERJOINED:
                console.log("New player has joined: ID " + p.name);
                this.addEnemy(p.userID, new PlayerInfo({userID: p.userID, userName: p.name, killCount: 0, deathCount: 0}))
                showTicket(`${StringHelper.truncateString(p.name, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH)} has joined`);
                break;
            case OpCode.SERVER_PLAYERLEFT:
                console.log("Player has left: ID " + p.name);
                this.removeEnemy(p.userID);
                showTicket(`${StringHelper.truncateString(p.name, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH)} has left`);
                break;
            case OpCode.SERVER_SENDALLPLAYERINFO:
                console.log("Server has sent all player info");
                this.synchronizeEnemyList(p.playerInfoList);
                break;
            case OpCode.SERVER_SENDALLPLAYERKD:
                console.log("Server has sent all player K/D");
                this.synchronizeEnemyList(p.playerKillDeathList);
                break;
            case OpCode.SERVER_TELEPORT:
                console.log("Player with ID" + p.userID + "has been teleported to" + p.coorX + "|" + p.coorY);
                this.teleport(p);
                break;
            case OpCode.SERVER_SHOOTING:
                this.enemyMap.get(p.userID).shoot(this.player.getPosition);
                break;
            case OpCode.SERVER_MAPCHANGE:
                // TODO 
            default:
                break;
        }
    }

    /**
     * Updates Player or Enemy information.
     * @param playerInfoOld Old {@link PlayerInfo} to be processed.
     * @param playerInfoNew New {@link PlayerInfo} to be processed.
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
        //var ranking:  Array<PlayerInfo>;
        for (let index = 0; index < list.length; index++) {
            let userID = list[index].userID;
            if (this.enemyMap.has(userID)) {
                this.updatePlayerInfo(this.enemyMap.get(userID).getPlayerInfo, list[index]);
            } else {
                this.addEnemy(userID, list[index]);
            }
            //ranking.push(list[index]);
        }
        //ranking.sort((a, b) => (b.killCount-b.deathCount) - (a.killCount-a.deathCount));
        //updateScoreboard(ranking);
    }

    /**
     * Removes an {@link Enemy} from the map.
     * @param userID ID of the {@link Enemy} to be removed.
     */
    private removeEnemy(userID: number) {
        if (this.enemyMap.has(userID)){
            this.enemyMap.delete(userID);
        }
    }

    /**
     * Adds an {@link Enemy} to the map.
     * @param userID ID of the {@link Enemy} to be added.
     * @param playerInfo {@link PlayerInfo} instance containing all information of {@link Enemy}.
     */
    private addEnemy(userID: number, playerInfo: PlayerInfo) {
        let enemyToAdd = new Enemy();
        enemyToAdd.setPlayerInfo = playerInfo;
        this.enemyMap.set(userID, enemyToAdd);
    }

    /**
     * Handles death of player or enemy.
     * @param killerID Who has defeated an {@link Player} or {@link Enemy}.
     * @param victimID {@link Player} or {@link Enemy} who has been defeated.
     */
    private playerDeath(killerID: number, victimID: number){
        // Has player been defeated?
        if (victimID === this.player.getPlayerInfo.userID) {
            displayRespawn(true);
            this.player.setDead(true);
            this.player.getPlayerInfo.deathCount++;
            updatePlayerInfo(this.player.getPlayerInfo);
            let killerName = this.enemyMap.get(killerID).getPlayerInfo.getUserName;
            killerName = StringHelper.truncateString(killerName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            let victimName = this.player.getPlayerInfo.getUserName;
            victimName = StringHelper.truncateString(victimName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            showTicket(`${killerName} ${StringHelper.randomKillVerb()} ${victimName}`);      
        } else {
            // Fallback to prevent crash if victim isn't present in client-internal enemy map
            if(!this.enemyMap.has(victimID) || this.enemyMap.get(victimID).getPlayerInfo == undefined){
                console.error("Tried to get id " + victimID + "but was not present in enemy map!");
                return;
            }
            this.enemyMap.get(victimID).getPlayerInfo.isDead = true;
        }
        if (killerID === this.player.getPlayerInfo.userID) {
            this.player.getPlayerInfo.killCount++;
            updatePlayerInfo(this.player.getPlayerInfo);
            let killerName = this.player.getPlayerInfo.getUserName;
            killerName = StringHelper.truncateString(killerName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            let victimName = this.enemyMap.get(victimID).getPlayerInfo.getUserName;
            victimName = StringHelper.truncateString(victimName, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
            showTicket(`${killerName} ${StringHelper.randomKillVerb()} ${victimName}`); 
        }
    }

    /**
     * Handles movement
     * @param p Packet received from the server.
     */
    private movement(p: Packet) {
        this.enemyMap.get(p.userID).setPosition = new Vec2D(p.coorX, p.coorY);
        this.enemyMap.get(p.userID).setAngle = p.angle;
        this.enemyMap.get(p.userID).walk();
        this.enemyMap.get(p.userID).updateDistanceToPlayer(this.player.getPosition);
    }

    /**
     * Handles teleportation, as well as respawning.
     * @param p Packet received from the server.
     */
    private teleport(p: Packet) {
        const newPosition = new Vec2D(p.coorX, p.coorY);
        if (p.userID === this.player.getPlayerInfo.userID) {
            displayRespawn(false);
            // If player gets teleported (also happening when spawning), set player not not dead.
            this.player.setDead(false);
            // Transport player to new position.
            this.player.setPosition = newPosition;
        } else {
            this.enemyMap.get(p.userID).setPosition = newPosition;
            this.enemyMap.get(p.userID).getPlayerInfo.isDead = false;
        }
    }
    
    /**
     * Stops the game and returns the player to the landing page.
     */
    private cancelGame(){
        loadPage('./index.html');
    }

    public get getEnemies() {
        return Array.from(this.enemyMap.values());
    }
}