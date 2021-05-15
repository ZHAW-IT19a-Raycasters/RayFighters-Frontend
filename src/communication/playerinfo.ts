import { StringHelper } from "../common/stringhelper";

/**
 * Container class for player info.
 * This is especially used for the SendAllPlayerInfo and SendAllPlayerKD
 * OpCodes as a pure data container class.
 */
export class PlayerInfo {
    /**
     * Maximum amount of characters for player tag
     */
    public static readonly TRUNCATED_NAME_MAX_LENGTH = 16;

    public userID: number;
    private userName?: string;
    public killCount?: number;
    public deathCount?: number;
    public isDead?: boolean;
    private truncatedUserName?: string;

    constructor({ userID, userName, killCount, deathCount, isDead }: { userID?: number, userName?: string, killCount?: number, deathCount?: number, isDead?: boolean }) {
        this.userID = userID;
        if (userName) {
            this.setUserName = userName;
        }
        this.killCount = killCount;
        this.deathCount = deathCount;
        this.isDead = isDead;
    }

    /**
     * Automatically creates truncated user name.
     */
    public set setUserName(name: string) {
        this.userName = name;
        this.truncatedUserName = StringHelper.truncateString(name, PlayerInfo.TRUNCATED_NAME_MAX_LENGTH);
    }

    public get getUserName(): string {
        return this.userName;
    }

    public get getTruncatedUserName(): string {
        return this.truncatedUserName;
    }
}