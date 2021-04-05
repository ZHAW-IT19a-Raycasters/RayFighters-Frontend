import { OpCode, Packet, PlayerInfo } from "../src/packet";
import { ProtocolParser } from "../src/protocolparser";
const { TextEncoder } = require("fastestsmallesttextencoderdecoder");


const protocolParser: ProtocolParser = new ProtocolParser();
let serverMessage: Uint8Array;
let expectedPacket: Packet;

describe('Server side protocol parser unit test', () => {
    it('should parse disconnect correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_DISCONNECT]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_DISCONNECT });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
    })

    it('should parse unknown messages correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_UNKNOWN]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_UNKNOWN });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
    })

    it('should parse movement correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_MOVEMENT, 0x44, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xB9, 0x3F, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xC9, 0x3F]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_MOVEMENT, userID: 0x44, coorX: 0.1, coorY: 0.2 });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
        expect(protocolParser.parse(serverMessage).coorX).toBe(expectedPacket.coorX);
        expect(protocolParser.parse(serverMessage).coorY).toBe(expectedPacket.coorY);
    })

    it('should parse player death correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERDEATH, 0x45, 0x46]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERDEATH, victimID: 0x45, killerID: 0x46 });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).victimID).toBe(expectedPacket.victimID);
        expect(protocolParser.parse(serverMessage).killerID).toBe(expectedPacket.killerID);
    })

    it('should parse player joined correctly', () => {
        const textEncoder = new TextEncoder();
        const playerName: any = textEncoder.encode("ATotalyRandomName🤬");
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERJOINED, 0x42, playerName.length, 0x00, 0x41, 0x54, 0x6f, 0x74, 0x61, 0x6c, 0x79, 0x52, 0x61, 0x6e, 0x64, 0x6f, 0x6d, 0x4e, 0x61, 0x6d, 0x65, 0xf0, 0x9f, 0xa4, 0xac]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERJOINED, userID: 0x42, name: playerName.toString() });
        expect(protocolParser.parse(serverMessage).name.length).toBe(playerName.toString().length);
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
        expect(protocolParser.parse(serverMessage).name).toBe(expectedPacket.name);
    })

    it('should parse player left correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERLEFT, 0x69]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERLEFT, userID: 0x69 });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
    })

    it('should parse \'you are called\' correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_YOUARECALLED, 0xAA]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_YOUARECALLED, userID: 0xAA });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
    })

    it('should parse all player info correctly', () => {
        const playerInfo: Array<PlayerInfo> = new Array<PlayerInfo>(3);
        playerInfo[0] = new PlayerInfo({ userID: 1, userName: "Hans" });
        playerInfo[1] = new PlayerInfo({ userID: 4, userName: "Peter" });
        playerInfo[2] = new PlayerInfo({ userID: 52, userName: "Meier" });
        serverMessage = new Uint8Array([OpCode.SERVER_SENDALLPLAYERINFO, 0x3, 0x1, 0x4, 0x0, 0x48, 0x61, 0x6E, 0x73, 0x4, 0x5, 0x0, 0x50, 0x65, 0x74, 0x65, 0x72, 0x34, 0x5, 0x0, 0x4D, 0x65, 0x69, 0x65, 0x72]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).playerCount).toBe(expectedPacket.playerCount);
        expect(protocolParser.parse(serverMessage).playerInfoList[0]).toEqual(expectedPacket.playerInfoList[0]);
        expect(protocolParser.parse(serverMessage).playerInfoList[1]).toEqual(expectedPacket.playerInfoList[1]);
        expect(protocolParser.parse(serverMessage).playerInfoList[2]).toEqual(expectedPacket.playerInfoList[2]);
    })

    it('should parse all player kill/death data correctly', () => {
        const playerKD = new Array<PlayerInfo>(3);
        playerKD[0] = new PlayerInfo({ userID: 1, killCount: 11, deathCount: 12 });
        playerKD[1] = new PlayerInfo({ userID: 4, killCount: 12, deathCount: 13 });
        playerKD[2] = new PlayerInfo({ userID: 52, killCount: 66, deathCount: 101 });
        serverMessage = new Uint8Array([OpCode.SERVER_SENDALLPLAYERKD, 0x3, 0x1, 0xB, 0x0, 0xC, 0x0, 0x4, 0xC, 0x0, 0xD, 0x0, 0x34, 0x42, 0x0, 0x65, 0x0]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERKD, playerCount: 3, playerKillDeathList: playerKD });
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).playerCount).toBe(expectedPacket.playerCount);
        expect(protocolParser.parse(serverMessage).playerKillDeathList[0]).toEqual(expectedPacket.playerKillDeathList[0]);
        expect(protocolParser.parse(serverMessage).playerKillDeathList[1]).toEqual(expectedPacket.playerKillDeathList[1]);
        expect(protocolParser.parse(serverMessage).playerKillDeathList[2]).toEqual(expectedPacket.playerKillDeathList[2]);
    })
})
