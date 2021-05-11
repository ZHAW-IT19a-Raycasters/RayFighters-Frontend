import { Vec2D } from "../common/vec2d";
import { Player } from "../player/player";
import { Enemy } from "../entities/enemy";
import { OpCode } from "./opcode";
import { Packet } from "./packet";
import { PlayerInfo } from "./playerinfo";

export class ServerConnection {
    /**
     * Current player instance
     */
    private player: Player

    /**
     * Map of all enemies (other players), mapped from userID to PlayerInfo instance.
     */
    private enemyMap: Map<number, Enemy>;

    private updateEnemyCallback: any;

    constructor(player: Player, updateEnemyCallback: any) {
        this.player = player;
        this.enemyMap = new Map<number, Enemy>();
        this.updateEnemyCallback = updateEnemyCallback;
    }

    /**
     * Handles all communication from the server.
     * @param p the parsed packet received from the server.
     */
    public handlePacket(p: Packet) {
        switch (p.opCode) {
            // TODO create methods for each case
            case OpCode.SERVER_PLAYERDEATH:
                this.playerDeath(p.killerID, p.victimID);
                break;
            case OpCode.SERVER_DISCONNECT:
                alert("Server has disconnected!");
                // TODO: Handle disconnect
                break;
            case OpCode.SERVER_UNKNOWN:
                alert("Server has sent unknown message");
                // TODO: Handle unknown
                break;
            case OpCode.SERVER_MOVEMENT:
                this.enemyMap.get(p.userID).setPosition = new Vec2D(p.coorX, p.coorY);
                this.enemyMap.get(p.userID).setAngle = p.angle;
                this.enemyMap.get(p.userID).walk();
                this.enemyMap.get(p.userID).updateDistanceToPlayer(this.player.getPosition);
                break;
            case OpCode.SERVER_YOUARECALLED:
                console.log("Your ID is: " + p.userID);
                this.player.getPlayerInfo.userID = p.userID
                break;
            case OpCode.SERVER_PLAYERJOINED:
                console.log("New player has joined: ID " + p.name);
                this.addEnemy(p.userID, new PlayerInfo({userID: p.userID, userName: p.name, killCount: 0, deathCount: 0}))
                break;
            case OpCode.SERVER_PLAYERLEFT:
                console.log("Player has left: ID " + p.name);
                this.removeEnemy(p.userID);
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
                const newPosition = new Vec2D(p.coorX, p.coorY);
                if (p.userID === this.player.getPlayerInfo.userID) {
                    // If player gets teleported (also happening when spawning), set player not not dead.
                    this.player.setDead(false);
                    // Transport player to new position.
                    this.player.setPosition = newPosition;
                } else {
                    this.enemyMap.get(p.userID).setPosition = newPosition;
                    this.enemyMap.get(p.userID).getPlayerInfo.isDead = false;
                }
                break;
            case OpCode.SERVER_SHOOTING:
                this.enemyMap.get(p.userID).shoot(this.player.getPosition);
                // TODO play sound
                break;
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
        if (playerInfoNew.userName) {
            playerInfoOld.userName = playerInfoNew.userName;
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
            if (userID === this.player.getPlayerInfo.userID) {
                this.updatePlayerInfo(this.player.getPlayerInfo, list[index]);
            } else if (this.enemyMap.has(userID)) {
                this.updatePlayerInfo(this.enemyMap.get(userID).getPlayerInfo, list[index]);
            } else {
                this.addEnemy(userID, list[index]);
            }
        }
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
            // TODO: Call GUI
            this.player.setDead(true);
        } else {
            this.enemyMap.get(victimID).getPlayerInfo.isDead = true;
        }
                
        // TODO update kill feed
    }

    public get getEnemies() {
        return Array.from(this.enemyMap.values());
    }
}