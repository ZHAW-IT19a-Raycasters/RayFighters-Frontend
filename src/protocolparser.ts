import { OpCode, Packet } from "./packet";

const { TextDecoder } = require("fastestsmallesttextencoderdecoder");
/**
 * Parses messages from the server and compiles messages to the server.
 */
export class ProtocolParser {

    /**
     * Parse a chunk of byte stream received from the server.
     * @param message Array of bytes sent from server.
     * @returns a new Packet object containing the opcode and optional parameters.
     */
    public parse(message: Uint8Array): Packet {
        let packet;
        const opCode = message[0] as OpCode;
        switch (opCode) {
            case OpCode.SERVER_DISCONNECT:
            case OpCode.SERVER_UNKNOWN:
                packet = new Packet({ opCode: opCode });
                break;
            case OpCode.SERVER_MOVEMENT:
                packet = new Packet({ opCode: opCode, userID: message[1], coorX: this.parseFloat(message, 2), coorY: this.parseFloat(message, 10) });
                break;
            case OpCode.SERVER_PLAYERDEATH:
                packet = new Packet({ opCode: opCode, victimID: message[1], killerID: message[2] });
                break;
            case OpCode.SERVER_PLAYERJOINED:
                packet = new Packet({ opCode: opCode, userID: message[1], name: this.assembleString(message, 2) });
                break;
            case OpCode.SERVER_PLAYERLEFT:
            case OpCode.SERVER_YOUARECALLED:
                packet = new Packet({ opCode: opCode, userID: message[1] });
                break;
            case OpCode.SERVER_SENDALLPLAYERINFO:
                packet = new Packet({ opCode: opCode, playerCount: message[1] });
                break;
            case OpCode.SERVER_SENDALLPLAYERKD:
                break;
        }
        return packet;
    }

    /**
     * Assembles a string from given byte array.
     * @param byteData raw byte data from server.
     * @param startIndex starting index from byte array message.
     * @returns a fully assembled string.
     */
    private assembleString(byteData: Uint8Array, startIndex: number): string {
        let numberOfChars = byteData[startIndex + 1] | byteData[startIndex] << 8;
        return new TextDecoder('utf8').decode(byteData.slice(startIndex, startIndex + numberOfChars));
    }

    /**
     * Assembles a float64 number from a given byte array.
     * @param byteData raw byte data from server.
     * @param startIndex starting index from byte array message.
     * @returns a fully assembled float number.
     */
    private parseFloat(byteData: Uint8Array, startIndex: number): number {
        const float = new Float64Array(
            new Uint8Array([
                byteData[startIndex + 0],
                byteData[startIndex + 1],
                byteData[startIndex + 2],
                byteData[startIndex + 3],
                byteData[startIndex + 4],
                byteData[startIndex + 5],
                byteData[startIndex + 6],
                byteData[startIndex + 7]
            ]).buffer)[0]
        return float;
    }

    /**
     * 
     * @param packet 
     * @returns 
     */
    public serialize(packet: Packet): Uint8Array {

        return new Uint8Array;
    }
}