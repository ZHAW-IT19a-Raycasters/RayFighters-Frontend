import { OpCode } from "./opcode";
import { PlayerInfo } from "./playerinfo";

/**
 * Data structure containing the opcode and parameters.
 * This is essentialy the pretty version of what gets sent back and forth
 * between the client and server. Note that a Packet instance could very well
 * have only very few fields defined, sometimes just the opCode.
 */
export class Packet {
    /**
     * Opcode, determines which command the game should interpret.
     * See: https://github.zhaw.ch/raycasters/docs/wiki/Protocol#opcode
     */
    // Server side abbreviated name
    public opCode: OpCode;
    public coorX?: number;          // X axis coordinate
    public coorY?: number;          // Y axis coordinate
    public angle?: number;          // AngPL
    public userID?: number;         // UserID
    public victimID?: number;       // KilledID
    public killerID?: number;       // MurderID
    public name?: string;           // Name
    public playerCount?: number;    // PlCount
    public playerInfoList?: PlayerInfo[];
    public playerKillDeathList?: PlayerInfo[];
    public mapID: number;
    public time: bigint;

    constructor
        (
            {
                opCode,
                coorX,
                coorY,
                angle,
                userID,
                victimID,
                killerID,
                name,
                playerCount,
                playerInfoList,
                playerKillDeathList,
                mapID,
                time
            }: {
                opCode: OpCode,
                coorX?: number,
                coorY?: number,
                angle?: number,
                userID?: number,
                victimID?: number,
                killerID?: number,
                name?: string,
                playerCount?: number,
                playerInfoList?: PlayerInfo[],
                playerKillDeathList?: PlayerInfo[],
                mapID?: number,
                time?: bigint
            }
        ) {
        this.opCode = opCode;
        this.coorX = coorX;
        this.coorY = coorY;
        this.angle = angle;
        this.userID = userID;
        this.victimID = victimID;
        this.killerID = killerID;
        this.name = name;
        this.playerCount = playerCount;
        this.playerInfoList = playerInfoList;
        this.playerKillDeathList = playerKillDeathList;
        this.mapID = mapID;
        this.time = time;
    }
}

