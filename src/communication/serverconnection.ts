import { Vec2D } from "../common/vec2d";
import { Player } from "../player/player";
import { Enemy } from "../sprites/enemy";
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

    constructor(player: Player) {
        this.player = player;
        this.enemyMap = new Map<number, Enemy>();
    }

    /**
     * Handles all communication from the server.
     * @param p the parsed packet received from the server.
     */
    public handlePacket(p: Packet) {
        switch (p.opCode) {
            case OpCode.SERVER_PLAYERDEATH:
                alert("You have died!");
                // TODO: Handle player death
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
                alert("Player with ID" + p.userID + "has moved to" + p.coorX + "|" + p.coorY);
                this.enemyMap.get(p.userID).setPosition = new Vec2D(p.coorX, p.coorY);
                break;
            case OpCode.SERVER_YOUARECALLED:
                alert("Your ID is: " + p.userID);
                this.player.getPlayerInfo.userID = p.userID
                break;
            case OpCode.SERVER_PLAYERJOINED:
                alert("New player has joined: ID " + p.name);
                this.addEnemy(p.userID, new PlayerInfo({userID: p.userID, userName: p.name, killCount: 0, deathCount: 0}))
                break;
            case OpCode.SERVER_PLAYERLEFT:
                alert("Player has left: ID " + p.name);
                this.removeEnemy(p.userID);
                break;
            case OpCode.SERVER_SENDALLPLAYERINFO:
                alert("Server has sent all player info");
                this.synchronizeEnemyList(p.playerInfoList);
                break;
            case OpCode.SERVER_SENDALLPLAYERKD:
                alert("Server has sent all player K/D");
                this.synchronizeEnemyList(p.playerKillDeathList);
                break;
            case OpCode.SERVER_TELEPORT:
                alert("Player with ID" + p.userID + "has been teleported to" + p.coorX + "|" + p.coorY);
                const newPosition = new Vec2D(p.coorX, p.coorY);
                if (p.userID === this.player.getPlayerInfo.userID) {
                    this.player.setPosition = newPosition;
                } else {
                    this.enemyMap.get(p.userID).setPosition = newPosition;
                }
                break;
            case OpCode.SERVER_SHOOTING:
                alert("Player with ID" + p.userID + "has shot in angle " + p.angle);
                // TODO: Handle player K/D
                break;
            default:
                break;
        }
    }

    /**
     * Updates Player or Enemy information.
     * @param playerInfoOld 
     * @param playerInfoNew 
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
    }

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

    private removeEnemy(userID: number) {
        if (this.enemyMap.has(userID)){
            this.enemyMap.delete(userID);
        }
    }

    private addEnemy(userID: number, playerInfo: PlayerInfo) {
        let enemyToAdd = new Enemy();
        enemyToAdd.setPlayerInfo = playerInfo;
        this.enemyMap.set(userID, enemyToAdd);
    }
}