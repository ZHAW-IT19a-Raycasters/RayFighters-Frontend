import { OpCode } from "../src/communication/opcode"
import { Packet } from "../src/communication/packet"
import { PlayerInfo } from "../src/communication/playerinfo"

const testPlayerInfo = new Array<PlayerInfo>();
testPlayerInfo.push(new PlayerInfo(
    {
        userID: 11, 
        userName: 'test user',
        killCount: 22,
        deathCount: 33,
        isDead: true,
    }
));

describe('Packet unit test', () => {
    it('should instantiate a Packet object correctly', () => {
        // Minimal packet:
        let testPacket = new Packet({opCode: OpCode.CLIENT_DISCONNECT})
        expect(testPacket.opCode).toBe(OpCode.CLIENT_DISCONNECT);

        // Maximal packet:
        testPacket = new Packet(
            {
                opCode: OpCode.SERVER_DISCONNECT, 
                coorX: 1, 
                coorY: 2, 
                angle: 3, 
                userID: 4, 
                victimID: 5,
                playerCount: 6,
                name: 'test',
                playerInfoList: testPlayerInfo,
                playerKillDeathList: testPlayerInfo,
                mapID: 7,
                time: BigInt(1621790601)
            }
        );

        expect(testPacket.opCode).toBe(OpCode.SERVER_DISCONNECT);
        expect(testPacket.coorX).toBe(1);
        expect(testPacket.coorY).toBe(2);
        expect(testPacket.angle).toBe(3);
        expect(testPacket.userID).toBe(4);
        expect(testPacket.victimID).toBe(5);
        expect(testPacket.playerCount).toBe(6);
        expect(testPacket.name).toBe('test');
        expect(testPacket.playerInfoList).toBe(testPlayerInfo);
        expect(testPacket.playerKillDeathList).toBe(testPlayerInfo);
        expect(testPacket.mapID).toBe(7);
        expect(testPacket.time).toBe(BigInt(1621790601));
    })
})