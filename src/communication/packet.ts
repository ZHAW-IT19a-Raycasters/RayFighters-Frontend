import { OpCode } from "./opcode";


/**
 * Container class for player info.
 * This is especially used for the SendAllPlayerInfo and SendAllPlayerKD
 * OpCodes as a pure data container class.
 */
export class PlayerInfo {
    public userID: number;
    public userName?: string;
    public killCount?: number;
    public deathCount?: number;

    constructor({userID, userName, killCount, deathCount} : {userID?: number, userName?: string, killCount?: number, deathCount?: number}) {
        this.userID = userID;
        this.userName = userName;
        this.killCount = killCount;
        this.deathCount = deathCount;
    }
}

/**
 * Abstract data structure containing the opcode and parameters.
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
                playerKillDeathList
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
                playerKillDeathList?: PlayerInfo[]
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
    }
}

