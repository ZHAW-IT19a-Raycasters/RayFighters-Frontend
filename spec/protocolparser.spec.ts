import { OpCode, Packet } from "../src/packet";
import { ProtocolParser } from "../src/protocolparser";


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
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERDEATH, victimID: 0x45, killerID: 0x46});
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).victimID).toBe(expectedPacket.victimID);
        expect(protocolParser.parse(serverMessage).killerID).toBe(expectedPacket.killerID);
    })

    it('should parse player joined correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERJOINED, 0x69, 0x41, 0x54, 0x6f, 0x74, 0x61, 0x6c, 0x79, 0x52, 0x61, 0x6e, 0x64, 0x6f, 0x6d, 0x4e, 0x61, 0x6d, 0x65, 0xf0, 0x9f, 0xa4, 0xac]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERJOINED, userID: 0x69, name: "ATotalyRandomName🤬"});
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
        expect(protocolParser.parse(serverMessage).name).toBe(expectedPacket.name);
    })

    it('should parse player left correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_PLAYERLEFT, 0x69]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERLEFT, userID: 0x69});
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
    })

    it('should parse \'you are called\' correctly', () => {
        serverMessage = new Uint8Array([OpCode.SERVER_YOUARECALLED, 0xAA]);
        expectedPacket = new Packet({ opCode: OpCode.SERVER_YOUARECALLED, userID: 0xAA});
        expect(protocolParser.parse(serverMessage).opCode).toBe(expectedPacket.opCode);
        expect(protocolParser.parse(serverMessage).userID).toBe(expectedPacket.userID);
    })


})