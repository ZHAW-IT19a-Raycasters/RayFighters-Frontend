import { OpCode } from "./opcode";
import { Packet } from "./packet";

/**
 * Wrapper class for simplifying communication.
 * Creates new Packets and returns them through static Command instance (factory pattern)
 */
export class Command {
    /**
     * Singleton instance.
     */
    private static instance: Command;

    /**
     * Tells the server to disconnect.
     * @returns a disconnect packet.
     */
    public static disconnect() {
        return new Packet({ opCode: OpCode.CLIENT_DISCONNECT });
    }

    /**
     * Tells the server a predefined 'unknown' message.
     * @returns an unknown packet.
     */
    public static unknown() {
        return new Packet({ opCode: OpCode.CLIENT_UNKNOWN });
    }

    /**
     * Asks the server to send back the user ID of the player.
     * @returns a new 'who am I' packet.
     */
    public static whoAmI() {
        return new Packet({ opCode: OpCode.CLIENT_WHOAMI });
    }

    /**
     * Asks the server to send all player info.
     * @returns a new 'request player info' packet.
     */
    public static requestPlayerInfo() {
        return new Packet({ opCode: OpCode.CLIENT_REQUESTPLAYERINFO });
    }

    /**
     * Asks the server to send all player kill / death counts.
     * @returns a new 'request player kill / death count' packet.
     */
    public static requestPlayerKillDeathCount() {
        return new Packet({ opCode: OpCode.CLIENT_REQUESTPLAYERKD });
    }

    /**
     * Tells the server the user has moved on the playing field.
     * @param coordinateX new X coordinate of the player.
     * @param coordinateY new Y coordinate of the player.
     * @returns a new client movement packet.
     */
    public static movement(coordinateX: number, coordinateY: number) {
        return new Packet({ opCode: OpCode.CLIENT_MOVEMENT, coorX: coordinateX, coorY: coordinateY })
    }

    /**
     * Tells the server the user fired a shot.
     * @param angle Angle of shot.
     * @returns a new client shoot packet.
     */
    public static shoot(angle: number) {
        return new Packet({ opCode: OpCode.CLIENT_SHOOTING, angle: angle })
    }

    /**
     * Singleton getter, enabling singleton pattern.
     * @returns a singleton ProtocolParser instance.
     */
    public static get get(): Command {
        if (!Command.instance) {
            Command.instance = new Command();
        }

        return Command.instance;
    }
}