import { OpCode } from "./opcode";
import { Packet } from "./packet";
import { PlayerInfo } from "./playerinfo";


/**
 * Parses messages from the server and compiles messages to the server.
 * This parser shall adhere to the latest definition of our network protocol
 * found here:
 * 
 * https://github.zhaw.ch/raycasters/docs/wiki/Protocol#byte-stream
 */
export class ProtocolParser {
    /**
     * Singleton instance.
     */
    private static instance: ProtocolParser;

    /**
     * Provides functions to decode and encode strings into and from different encodings.
     */
    private textDecoder: TextDecoder;

    private constructor() {
        // Case if the protocol parser is running in node (for tests)
        if (typeof window === 'undefined') {
            const { TextDecoder } = require("fastestsmallesttextencoderdecoder");
            this.textDecoder = new TextDecoder();
        } else {
            this.textDecoder = new TextDecoder();
        }
    }
    /**
     * Parse a chunk of byte stream received from the server. We'll use this in
     * our gameloop to make things happen such as show where other players have
     * moved or who has shot, etc.
     * @param message Array of bytes sent from server.
     * @returns a new Packet object containing the opcode and optional parameters.
     */
    public parse(message: Uint8Array): Packet {
        let packet;
        console.assert(message != undefined);
        const opCode = message[0] as OpCode;
        switch (opCode) {
            case OpCode.SERVER_DISCONNECT:
            case OpCode.SERVER_UNKNOWN:
                packet = new Packet({ opCode: opCode });
                break;
            case OpCode.SERVER_TELEPORT:
                packet = new Packet({ opCode: opCode, userID: message[1], coorX: this.u8ArraytoFloat(message, 2), coorY: this.u8ArraytoFloat(message, 10) });
                break;
            case OpCode.SERVER_MOVEMENT:
                packet = new Packet({ opCode: opCode, userID: message[1], coorX: this.u8ArraytoFloat(message, 2), coorY: this.u8ArraytoFloat(message, 10), angle: this.u8ArraytoFloat(message, 18) });
                break;
            case OpCode.SERVER_SHOOTING:
                packet = new Packet({ opCode: opCode, userID: message[1], angle: this.u8ArraytoFloat(message, 2) });
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
                packet = new Packet({ opCode: opCode, playerCount: message[1], playerInfoList: this.assemblePlayerList(opCode, message.slice(2), message[1]) });
                break;
            case OpCode.SERVER_SENDALLPLAYERKD:
                packet = new Packet({ opCode: opCode, playerCount: message[1], playerKillDeathList: this.assemblePlayerList(opCode, message.slice(2), message[1]) });
                break;
            default:
                throw Error("Opcode not recognized! Can't parse!");
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
        let numberOfChars = this.u8ArrayToU16(byteData, startIndex);
        return this.textDecoder.decode(byteData.slice(startIndex + 2, startIndex + numberOfChars + 2));
    }

    /**
     * Assembles a float64 number from a given byte array.
     * @param byteData raw byte data from server.
     * @param startIndex starting index from byte array message.
     * @returns a fully assembled float number.
     */
    private u8ArraytoFloat(byteData: Uint8Array, startIndex: number): number {
        return new Float64Array(
            new Uint8Array([
                byteData[startIndex + 0],
                byteData[startIndex + 1],
                byteData[startIndex + 2],
                byteData[startIndex + 3],
                byteData[startIndex + 4],
                byteData[startIndex + 5],
                byteData[startIndex + 6],
                byteData[startIndex + 7]
            ]).buffer)[0];
    }

    /**
     * Assembles an unsigned 8-bit integer array from a number type (float)
     * @param floatToConvert number type float to be converted.
     * @returns a fully assembled unsigned 8-bit integer array.
     */
    private floatToU8Array(floatToConvert: number): Uint8Array {
        var data = new Float64Array([floatToConvert]);
        return new Uint8Array(data.buffer);
    }


    /**
     * Helper method to convert an unsigned 16-bit value from the byte stream to numbers.
     * @param byteData raw byte data from server.
     * @param byteOffset starting index from byte array message.
     * @returns a converter number type value.
     */
    private u8ArrayToU16(byteData: Uint8Array, byteOffset: number): number {
        let data = new DataView(new ArrayBuffer(2));
        data.setUint8(0, byteData[byteOffset]);
        data.setUint8(1, byteData[byteOffset + 1]);
        return data.getUint16(0, true);
    }

    private assemblePlayerList(opCode: OpCode, byteData: Uint8Array, playerCount: number): PlayerInfo[] {
        let playerInfos = new Array<PlayerInfo>(playerCount);
        let byteOffset: number = 0;
        switch (opCode) {
            case OpCode.SERVER_SENDALLPLAYERINFO:
                let stringLength: number = 0;
                for (let index = 0; index < playerCount; index++) {
                    stringLength = this.u8ArrayToU16(byteData, byteOffset + 1);
                    playerInfos[index] = new PlayerInfo({ userID: byteData[byteOffset], userName: this.assembleString(byteData, byteOffset + 1) });
                    byteOffset += 3 + stringLength;
                }
                break;
            case OpCode.SERVER_SENDALLPLAYERKD:
                for (let index = 0; index < playerCount; index++) {
                    playerInfos[index] = new PlayerInfo({ userID: byteData[byteOffset], killCount: this.u8ArrayToU16(byteData, byteOffset + 1), deathCount: this.u8ArrayToU16(byteData, byteOffset + 3) });
                    byteOffset += 5;
                }
                break;
        }
        return playerInfos;
    }

    /**
     * Convert a packet to a binary array compatible with our protocl
     * 
     * @param packet The packet we want to send over to the server
     * @returns Byte Array of protocol data to be sent to the server
     */
    public serialize(packet: Packet): Uint8Array {
        let byteData: Uint8Array; //= new Uint8Array(); Todo: initialize

        switch (packet.opCode) {
            case OpCode.CLIENT_DISCONNECT:
            case OpCode.CLIENT_UNKNOWN:
            case OpCode.CLIENT_WHOAMI:
            case OpCode.CLIENT_REQUESTPLAYERINFO:
            case OpCode.CLIENT_REQUESTPLAYERKD:
                byteData = new Uint8Array(1);
                byteData[0] = packet.opCode;
                break;

            case OpCode.CLIENT_MOVEMENT:
                byteData = new Uint8Array(25);
                byteData[0] = packet.opCode;
                let convertedFloatX: Uint8Array = this.floatToU8Array(packet.coorX);
                let convertedFloatY: Uint8Array = this.floatToU8Array(packet.coorY);
                let angle: Uint8Array = this.floatToU8Array(packet.angle);
                for (let index = 0; index < 8; index++) {
                    byteData[index + 1] = convertedFloatX[index];
                    byteData[index + 9] = convertedFloatY[index];
                    byteData[index + 17] = angle[index];
                }
                break;

            case OpCode.CLIENT_SHOOTING:
                byteData = new Uint8Array(9);
                byteData[0] = packet.opCode;
                let convertedFloat: Uint8Array = this.floatToU8Array(packet.angle);
                for (let index = 0; index < 8; index++) {
                    byteData[index + 1] = convertedFloat[index];
                }
                break;
                
            default:
                throw Error("Opcode not recognized! Can't serialize!");
        }
        return byteData;
    }

    /**
     * Singleton getter, enabling singleton pattern.
     * @returns a singleton ProtocolParser instance.
     */
    public static get get(): ProtocolParser {
        if (!ProtocolParser.instance) {
            ProtocolParser.instance = new ProtocolParser();
        }

        return ProtocolParser.instance;
    }

}