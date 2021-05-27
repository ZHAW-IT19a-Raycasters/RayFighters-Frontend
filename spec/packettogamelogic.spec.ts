import { OpCode } from "../src/communication/opcode";
import { Packet } from "../src/communication/packet";
import { PacketToGameLogic } from "../src/communication/packettogamelogic";
import { PlayerInfo } from "../src/communication/playerinfo";
import { Player } from "../src/player/player"
import { Vec2D } from "../src/common/vec2d";
import { GameHUD } from "./gamehudmock";

// Constants
const HUDmock = new GameHUD();

const playerInfo: Array<PlayerInfo> = new Array<PlayerInfo>(3);
playerInfo[0] = new PlayerInfo({ userID: 2, userName: "Hans" });
playerInfo[1] = new PlayerInfo({ userID: 3, userName: "Peter" });
playerInfo[2] = new PlayerInfo({ userID: 4, userName: "Meier" });

const playerKD = new Array<PlayerInfo>(3);
playerKD[0] = new PlayerInfo({ userID: 2, killCount: 11, deathCount: 12 });
playerKD[1] = new PlayerInfo({ userID: 3, killCount: 12, deathCount: 13 });
playerKD[2] = new PlayerInfo({ userID: 4, killCount: 66, deathCount: 101 });

/**
 * Sets up a standard {@link Player}.
 * @param id Player ID embedded in {@link PlayerInfo}
 * @returns a new {@link Player} instance.
 */
function setupPlayer(id: number): Player {
    const testPlayer = new Player(0, 0, 0, HUDmock);
    const testPlayerInfo = new PlayerInfo({ userID: id, deathCount: 0, killCount: 0, isDead: false})
    testPlayer.setPlayerInfo = testPlayerInfo;
    return testPlayer;
}

describe('Packet to game logic unit test', () => {
    it('should handle SERVER_SENDALLPLAYERINFO correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);

        // Test
        logic.handlePacket(playerInfoPacket);

        // Verificatiion
        expect(logic.getEnemies.length).toBe(3);
        for (let i = 0; i < playerInfo.length; i++) {
            expect(logic.getEnemies[i].getPlayerInfo.userID).toBe(playerInfo[i].userID);
            expect(logic.getEnemies[i].getPlayerInfo.getUserName).toBe(playerInfo[i].getUserName);
        }
    });

    it('should handle SERVER_SENDALLPLAYERKD correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const playerKDPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERKD, playerCount: 3, playerKillDeathList: playerKD });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);

        // Test
        logic.handlePacket(playerInfoPacket);
        logic.handlePacket(playerKDPacket);

        // Verificatiion
        expect(logic.getEnemies.length).toBe(3);
        for (let i = 0; i < playerInfo.length; i++) {
            expect(logic.getEnemies[i].getPlayerInfo.killCount).toBe(playerKD[i].killCount);
            expect(logic.getEnemies[i].getPlayerInfo.deathCount).toBe(playerInfo[i].deathCount);
        }
    })

    it('should handle SERVER_MOVEMENT correctly', () => {
        const testPlayer = setupPlayer(1);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const enemyMovementPacket = new Packet({ opCode: OpCode.SERVER_MOVEMENT, userID: 0x02, coorX: 6, coorY: 7 });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);

        // Test
        logic.handlePacket(playerInfoPacket);
        logic.getEnemies[0].setPosition = new Vec2D(0,0);
        logic.handlePacket(enemyMovementPacket);

        // Verificatiion
        expect(logic.getEnemies[0].getPosition.x).toBe(enemyMovementPacket.coorX);
        expect(logic.getEnemies[0].getPosition.y).toBe(enemyMovementPacket.coorY);
    })

    it('should handle SERVER_TELEPORT correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        testPlayer.setPosition = new Vec2D(0,0);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const playerTeleportPacket = new Packet({ opCode: OpCode.SERVER_TELEPORT, userID: 0x01, coorX: 4, coorY: 5 });
        const enemyTeleportPacket = new Packet({ opCode: OpCode.SERVER_TELEPORT, userID: 0x02, coorX: 6, coorY: 7 });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);

        // Test
        logic.handlePacket(playerInfoPacket);
        logic.handlePacket(playerTeleportPacket);
        logic.handlePacket(enemyTeleportPacket);

        // Verificatiion
        expect(testPlayer.getPosition.x).toBe(playerTeleportPacket.coorX);
        expect(testPlayer.getPosition.y).toBe(playerTeleportPacket.coorY);
        expect(logic.getEnemies[0].getPosition.x).toBe(enemyTeleportPacket.coorX);
        expect(logic.getEnemies[0].getPosition.y).toBe(enemyTeleportPacket.coorY);
    })

    
    it('should handle SERVER_PLAYERDEATH correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        let playerDeathPacket = new Packet({opCode: OpCode.SERVER_PLAYERDEATH, killerID: 2, victimID: 1});
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        logic.handlePacket(playerInfoPacket);
        logic.getEnemies[0].getPlayerInfo.isDead = false;

        // Negative Verification
        expect(logic.getEnemies[0].getPlayerInfo.isDead).toBe(false);
        expect(testPlayer.isDead).toBe(false);

        // Test
        logic.handlePacket(playerDeathPacket);

        // Positive Verification
        expect(logic.getEnemies[0].getPlayerInfo.isDead).toBe(false);
        expect(testPlayer.isDead).toBe(true);

        // Setup
        playerDeathPacket = new Packet({opCode: OpCode.SERVER_PLAYERDEATH, killerID: 1, victimID: 2});
        testPlayer.getPlayerInfo.isDead = false;

        // Test
        logic.handlePacket(playerDeathPacket);

        // Verification
        expect(testPlayer.isDead).toBe(false);
        expect(logic.getEnemies[0].getPlayerInfo.isDead).toBe(true);

        // Setup (negative test)
        playerDeathPacket = new Packet({opCode: OpCode.SERVER_PLAYERDEATH, killerID: 77, victimID: 66});

        // Test & Verification (negative test)
        expect(logic.handlePacket(playerDeathPacket)).not.toThrowError;
    });

    it('should handle SERVER_UNKNOWN without errors', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const unknownPacket = new Packet({ opCode: OpCode.SERVER_UNKNOWN });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        
        // Test & Verification
        expect(logic.handlePacket(unknownPacket)).not.toThrowError;
    })

    it('should handle SERVER_DISCONNECT without errors', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const disconnectPacket = new Packet({ opCode: OpCode.SERVER_DISCONNECT });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        
        // Test & Verification
        expect(logic.handlePacket(disconnectPacket)).not.toThrowError;
    })

    it('should handle SERVER_YOUARECALLED correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const youAreCalledPacket = new Packet({ opCode: OpCode.SERVER_YOUARECALLED, userID: 0x2 });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        
        // Test & Verification
        expect(logic.handlePacket(youAreCalledPacket)).not.toThrowError;
        expect(testPlayer.getPlayerInfo.userID).toBe(2);
    })

    it('should handle SERVER_PLAYERJOINED correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const playerJoinedPacket = new Packet({ opCode: OpCode.SERVER_PLAYERJOINED, userID: 0x2 });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        
        // Test & Verification
        expect(logic.handlePacket(playerJoinedPacket)).not.toThrowError;
        expect(logic.getEnemies[0].getPlayerInfo.userID).toBe(2);
    })

    it('should handle SERVER_PLAYERLEFT correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const playerJoinedPacket1 = new Packet({ opCode: OpCode.SERVER_PLAYERJOINED, userID: 0x2 });
        const playerJoinedPacket2 = new Packet({ opCode: OpCode.SERVER_PLAYERJOINED, userID: 0x3 });
        const playerLeftPacket = new Packet({ opCode: OpCode.SERVER_PLAYERLEFT, userID: 0x2 });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        
        // Test & Verification
        expect(logic.handlePacket(playerJoinedPacket1)).not.toThrowError;
        expect(logic.getEnemies[0].getPlayerInfo.userID).toBe(2);
        expect(logic.handlePacket(playerJoinedPacket2)).not.toThrowError;
        expect(logic.getEnemies[1].getPlayerInfo.userID).toBe(3);
        expect(logic.handlePacket(playerLeftPacket)).not.toThrowError;
        expect(logic.getEnemies[0].getPlayerInfo.userID).toBe(3);
        expect(logic.getEnemies[1]).toBeUndefined;
    })

    it('should handle SERVER_SHOOTING correctly', () => {
        // Setup
        const testPlayer = setupPlayer(1);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const shootPacket = new Packet({ opCode: OpCode.SERVER_SHOOTING, userID: 0x4, angle: 0.1 });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);
        
        // Test & Verification
        logic.handlePacket(playerInfoPacket);
        expect(logic.getEnemies[2].getShot).toBe(false);
        logic.handlePacket(shootPacket);
        expect(logic.getEnemies[2].getShot).toBe(true);
    })

    it('should handle SERVER_MAPCHANGE correctly', () => {
        // Setup
        const mapID = 5;
        const time = BigInt(10101010);
        const testPlayer = setupPlayer(1);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const mapChangePacket = new Packet({ opCode: OpCode.SERVER_MAPCHANGE, mapID, time });
        const logic = new PacketToGameLogic(testPlayer, HUDmock);

        // Test & Verification
        logic.handlePacket(playerInfoPacket);
        logic.handlePacket(mapChangePacket);
        expect(logic.getCurrentMapID).toBe(mapID);
        expect(logic.getCurrentTime).toBe(time);  
    })
});