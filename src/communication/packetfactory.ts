import { OpCode } from "./opcode";
import { Packet } from "./packet";

/**
 * Factory Pattern Class for wrapping packet generation for communication.
 * See {@link https://en.wikipedia.org/wiki/Factory_method_pattern#Example_implementations}
 *
 * Creates new Packets and returns them through static Command instance (factory pattern).
 * Using this wrapper to create commands to the server is super easy. Just call
 * its methods with 'Command.whoAmI()', 'Command.move(1.0, 2.0)' and so on.
 */
export class PacketFactory {
    /**
      * Don't instantiate me, use my static methods.
      */
    private constructor() { /* no op */ }

    /**
     * Tells the server to disconnect.
     * @returns a disconnect packet.
     */
    public static disconnect(): Packet {
        return new Packet({ opCode: OpCode.CLIENT_DISCONNECT });
    }

    /**
     * Tells the server a predefined 'unknown' message.
     * @returns an unknown packet.
     */
    public static unknown(): Packet {
        return new Packet({ opCode: OpCode.CLIENT_UNKNOWN });
    }

    /**
     * Asks the server to send back the user ID of the player.
     * @returns a new 'who am I' packet.
     */
    public static whoAmI(): Packet {
        return new Packet({ opCode: OpCode.CLIENT_WHOAMI });
    }

    /**
     * Asks the server to send all player info.
     * @returns a new 'request player info' packet.
     */
    public static requestPlayerInfo(): Packet {
        return new Packet({ opCode: OpCode.CLIENT_REQUESTPLAYERINFO });
    }

    /**
     * Asks the server to send all player kill / death counts.
     * @returns a new 'request player kill / death count' packet.
     */
    public static requestPlayerKillDeathCount(): Packet {
        return new Packet({ opCode: OpCode.CLIENT_REQUESTPLAYERKD });
    }

    /**
     * Tells the server the user has moved on the playing field.
     * @param {number} coordinateX - new X coordinate of the player.
     * @param {number} coordinateY - new Y coordinate of the player.
     * @param {number} angle - angle the player is looking at.
     * @returns a new client movement packet.
     */
    public static move(coordinateX: number, coordinateY: number, angle: number): Packet {
        return new Packet({ opCode: OpCode.CLIENT_MOVEMENT, coorX: coordinateX, coorY: coordinateY, angle: angle })
    }

    /**
     * Tells the server the user fired a shot.
     * @param {number} angle - Angle of shot.
     * @returns a new client shoot packet.
     */
    public static shoot(angle: number): Packet {
        return new Packet({ opCode: OpCode.CLIENT_SHOOTING, angle: angle })
    }
}
