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