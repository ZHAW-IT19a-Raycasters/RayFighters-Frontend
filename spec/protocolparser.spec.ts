import { OpCode } from "../src/communication/opcode";
import { Packet, PlayerInfo } from "../src/communication/packet";
import { ProtocolParser } from "../src/communication/protocolparser";
const { TextEncoder } = require("fastestsmallesttextencoderdecoder");


let serverMessage: Uint8Array;
let expectedPacket: Packet;

describe('Server side protocol parser unit test', () => {
    it('should parse disconnect correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_DISCONNECT]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_DISCONNECT });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
    })

    it('should parse unknown messages correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_UNKNOWN]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_UNKNOWN });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
    })

    it('should parse movement correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_MOVEMENT, 0x44, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xB9, 0x3F, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xC9, 0x3F]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_MOVEMENT, userID: 0x44, coorX: 0.1, coorY: 0.2 });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).userID).toBe(expectedPacket.userID);
        expect(ProtocolParser.get.parse(serverMessage).coorX).toBe(expectedPacket.coorX);
        expect(ProtocolParser.get.parse(serverMessage).coorY).toBe(expectedPacket.coorY);
    })

    it('should parse player death correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERDEATH, 0x45, 0x46]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERDEATH, victimID: 0x45, killerID: 0x46 });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).victimID).toBe(expectedPacket.victimID);
        expect(ProtocolParser.get.parse(serverMessage).killerID).toBe(expectedPacket.killerID);
    })

    it('should parse player joined correctly', () => {
        const textEncoder = new TextEncoder();
        const playerName: any = textEncoder.encode("ATotalyRandomName🤬");
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERJOINED, 0x42, playerName.length, 0x00, 0x41, 0x54, 0x6f, 0x74, 0x61, 0x6c, 0x79, 0x52, 0x61, 0x6e, 0x64, 0x6f, 0x6d, 0x4e, 0x61, 0x6d, 0x65, 0xf0, 0x9f, 0xa4, 0xac]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERJOINED, userID: 0x42, name: playerName.toString() });
        expect(ProtocolParser.get.parse(serverMessage).name.length).toBe(playerName.toString().length);
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).userID).toBe(expectedPacket.userID);
        expect(ProtocolParser.get.parse(serverMessage).name).toBe(expectedPacket.name);
    })

    it('should parse player left correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERLEFT, 0x69]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERLEFT, userID: 0x69 });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).userID).toBe(expectedPacket.userID);
    })

    it('should parse \'you are called\' correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_YOUARECALLED, 0xAA]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_YOUARECALLED, userID: 0xAA });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).userID).toBe(expectedPacket.userID);
    })

    it('should parse all player info correctly', () => {
        const playerInfo: Array<PlayerInfo> = new Array<PlayerInfo>(3);
        playerInfo[0] = new PlayerInfo({ userID: 1, userName: "Hans" });
        playerInfo[1] = new PlayerInfo({ userID: 4, userName: "Peter" });
        playerInfo[2] = new PlayerInfo({ userID: 52, userName: "Meier" });
        serverMessage = new Uint8Array([OpCode.SERVER_SENDALLPLAYERINFO, 0x3, 0x1, 0x4, 0x0, 0x48, 0x61, 0x6E, 0x73, 0x4, 0x5, 0x0, 0x50, 0x65, 0x74, 0x65, 0x72, 0x34, 0x5, 0x0, 0x4D, 0x65, 0x69, 0x65, 0x72]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).playerCount).toBe(expectedPacket.playerCount);
        expect(ProtocolParser.get.parse(serverMessage).playerInfoList[0]).toEqual(expectedPacket.playerInfoList[0]);
        expect(ProtocolParser.get.parse(serverMessage).playerInfoList[1]).toEqual(expectedPacket.playerInfoList[1]);
        expect(ProtocolParser.get.parse(serverMessage).playerInfoList[2]).toEqual(expectedPacket.playerInfoList[2]);
    })

    it('should parse all player kill/death data correctly', () => {
        const playerKD = new Array<PlayerInfo>(3);
        playerKD[0] = new PlayerInfo({ userID: 1, killCount: 11, deathCount: 12 });
        playerKD[1] = new PlayerInfo({ userID: 4, killCount: 12, deathCount: 13 });
        playerKD[2] = new PlayerInfo({ userID: 52, killCount: 66, deathCount: 101 });
        serverMessage = new Uint8Array([OpCode.SERVER_SENDALLPLAYERKD, 0x3, 0x1, 0xB, 0x0, 0xC, 0x0, 0x4, 0xC, 0x0, 0xD, 0x0, 0x34, 0x42, 0x0, 0x65, 0x0]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERKD, playerCount: 3, playerKillDeathList: playerKD });
        expect(ProtocolParser.get.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(ProtocolParser.get.parse(serverMessage).playerCount).toBe(expectedPacket.playerCount);
        expect(ProtocolParser.get.parse(serverMessage).playerKillDeathList[0]).toEqual(expectedPacket.playerKillDeathList[0]);
        expect(ProtocolParser.get.parse(serverMessage).playerKillDeathList[1]).toEqual(expectedPacket.playerKillDeathList[1]);
        expect(ProtocolParser.get.parse(serverMessage).playerKillDeathList[2]).toEqual(expectedPacket.playerKillDeathList[2]);
    })
})

describe('Client side protocol serialize unit test', () => {
    it('should generate a byte stream representing disconnect, unknown, who am i, request player info and request player kill/death data correctly', () => {
        const opCodes = [OpCode.CLIENT_DISCONNECT, OpCode.CLIENT_UNKNOWN, OpCode.CLIENT_WHOAMI, OpCode.CLIENT_REQUESTPLAYERINFO, OpCode.CLIENT_REQUESTPLAYERKD];
        const expectedData = [0x00, 0x01, 0x02, 0x1E, 0x1F];
        let byteData: Uint8Array;
        let packet: Packet;

        for (let index = 0; index < opCodes.length; index++) {
            packet = new Packet({ opCode: opCodes[index] });
            byteData = ProtocolParser.get.serialize(packet);
            expect(byteData[0]).toBe(expectedData[index]);
            expect(byteData.length).toBe(1);
        }
    })

    it('should generate a byte stream representing movement data correctly', () => {
        const expectedData = [
            0x0A,                                               // Opcode
            0x00, 0x00, 0x00, 0x00, 0x00, 0xD0, 0x84, 0x40,     // X movement (666.0)
            0xA2, 0x45, 0xB6, 0xF3, 0xFD, 0x3F, 0x8F, 0x40      // Y movement (999.999)
        ];    
        const packet: Packet = new Packet({ opCode: OpCode.CLIENT_MOVEMENT, coorX: 666.0, coorY: 999.999 })
        const byteData = ProtocolParser.get.serialize(packet);
        expect(byteData.length).toBe(expectedData.length);
        for (let index = 0; index < expectedData.length; index++) {
            expect(byteData[index]).toBe(expectedData[index]);
        }
    })

    it('should generate a byte stream representing shooting correctly', () => {
        const expectedData = [
            0x14,                                               // Opcode
            0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0x1B, 0x40      // Angle (6.9)
        ];
        const packet: Packet = new Packet({ opCode: OpCode.CLIENT_SHOOTING, angle: 6.9 })
        const byteData = ProtocolParser.get.serialize(packet);
        expect(byteData.length).toBe(expectedData.length);
        for (let index = 0; index < expectedData.length; index++) {
            expect(byteData[index]).toBe(expectedData[index]);
        }
    })
})