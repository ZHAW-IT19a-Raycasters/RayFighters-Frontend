import { OpCode } from "../src/communication/opcode";
import { Packet } from "../src/communication/packet";
import { PacketToGameLogic } from "../src/communication/packettogamelogic";
import { PlayerInfo } from "../src/communication/playerinfo";
import { Player } from "../src/player/player"
import { JSDOM } from 'jsdom';
import * as fs from 'fs'
import { Vec2D } from "../src/common/vec2d";

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;

const playerInfo: Array<PlayerInfo> = new Array<PlayerInfo>(3);
playerInfo[0] = new PlayerInfo({ userID: 2, userName: "Hans" });
playerInfo[1] = new PlayerInfo({ userID: 3, userName: "Peter" });
playerInfo[2] = new PlayerInfo({ userID: 4, userName: "Meier" });

const playerKD = new Array<PlayerInfo>(3);
playerKD[0] = new PlayerInfo({ userID: 2, killCount: 11, deathCount: 12 });
playerKD[1] = new PlayerInfo({ userID: 3, killCount: 12, deathCount: 13 });
playerKD[2] = new PlayerInfo({ userID: 4, killCount: 66, deathCount: 101 });


describe('Packet to game logic unit test', () => {
    it('should handle SERVER_SENDALLPLAYERINFO correctly', () => {
        // Setup
        const testPlayer = new Player(0, 0, 0);
        const testPlayerInfo = new PlayerInfo({ userID: 1, deathCount: 0, killCount: 0, isDead: false})
        testPlayer.setPlayerInfo = testPlayerInfo;
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const logic = new PacketToGameLogic(testPlayer);

        // Test
        logic.handlePacket(playerInfoPacket);

        // Verificatiion
        expect(logic.getEnemies.length).toBe(3);
        for (let index = 0; index < playerInfo.length; index++) {
            expect(logic.getEnemies[index].getPlayerInfo.userID).toBe(playerInfo[index].userID);
            expect(logic.getEnemies[index].getPlayerInfo.getUserName).toBe(playerInfo[index].getUserName);
        }
    });

    it('should handle SERVER_SENDALLPLAYERKD correctly', () => {
        // Setup
        const testPlayer = new Player(0, 0, 0);
        const testPlayerInfo = new PlayerInfo({ userID: 1, deathCount: 0, killCount: 0, isDead: false})
        testPlayer.setPlayerInfo = testPlayerInfo;
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const playerKDPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERKD, playerCount: 3, playerKillDeathList: playerKD });
        const logic = new PacketToGameLogic(testPlayer);

        // Test
        logic.handlePacket(playerInfoPacket);
        logic.handlePacket(playerKDPacket);

        // Verificatiion
        expect(logic.getEnemies.length).toBe(3);
        for (let index = 0; index < playerInfo.length; index++) {
            expect(logic.getEnemies[index].getPlayerInfo.killCount).toBe(playerKD[index].killCount);
            expect(logic.getEnemies[index].getPlayerInfo.deathCount).toBe(playerInfo[index].deathCount);
        }
    })

    it('should handle SERVER_MOVEMENT correctly', () => {
        const testPlayer = new Player(0, 0, 0);
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const enemyMovementPacket = new Packet({ opCode: OpCode.SERVER_MOVEMENT, userID: 0x02, coorX: 6, coorY: 7 });
        const logic = new PacketToGameLogic(testPlayer);

        // Test
        logic.handlePacket(playerInfoPacket);
        logic.getEnemies[0].setPosition = new Vec2D(0,0);
        logic.handlePacket(enemyMovementPacket);

        // Verificatiion
        expect(logic.getEnemies[0].getPosition.x).toBe(enemyMovementPacket.coorX);
        expect(logic.getEnemies[0].getPosition.y).toBe(enemyMovementPacket.coorY);
    })

    it('should handle SERVER_TELEPORT correctly', () => {
        const testPlayer = new Player(0, 0, 0);
        const testPlayerInfo = new PlayerInfo({ userID: 1, deathCount: 0, killCount: 0, isDead: false})
        testPlayer.setPosition = new Vec2D(0,0);
        testPlayer.setPlayerInfo = testPlayerInfo; 
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const playerTeleportPacket = new Packet({ opCode: OpCode.SERVER_TELEPORT, userID: 0x01, coorX: 4, coorY: 5 });
        const enemyTeleportPacket = new Packet({ opCode: OpCode.SERVER_TELEPORT, userID: 0x02, coorX: 6, coorY: 7 });
        const logic = new PacketToGameLogic(testPlayer);

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
        const testPlayer = new Player(0, 0, 0);
        const testPlayerInfo = new PlayerInfo({ userID: 1, deathCount: 0, killCount: 0, isDead: false})
        testPlayer.setPlayerInfo = testPlayerInfo;

        let playerDeathPacket = new Packet({opCode: OpCode.SERVER_PLAYERDEATH, killerID: 2, victimID: 1});
        const playerInfoPacket = new Packet({ opCode: OpCode.SERVER_SENDALLPLAYERINFO, playerCount: 3, playerInfoList: playerInfo });
        const logic = new PacketToGameLogic(testPlayer);
        logic.handlePacket(playerInfoPacket);
        logic.getEnemies[0].getPlayerInfo.isDead = false;

        // Negative Verification
        expect(logic.getEnemies[0].getPlayerInfo.isDead).toBe(false);
        expect(testPlayer.isDead).toBe(false);

        // Test
        logic.handlePacket(playerDeathPacket);

        // Positive Verification
        console.log(logic.getEnemies)
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
    });
    
});