import { Enemy } from '../src/entities/enemy';
import { Room } from '../src/maps/room';

describe('Room unit testing', () => {
    it('should instantiate an empty room correctly', () => {
        // Setup
        const testSize = 2;
        const testElementCount = 2 ** testSize;

        // Test
        const testRoom = new Room({mapSize: testSize});

        // Verification
        expect(testRoom.getMap.getElementCount).toBe(testElementCount);
        expect(testRoom.getEnemies).toBeUndefined;
    });

    it('should handle added enemies correctly', () => {
        // Setup
        const testSize = 4;
        const testEnemy1 = new Enemy();
        const testEnemy2 = new Enemy();
        const testEnemyArray = new Array<Enemy>(testEnemy1, testEnemy2);
        
        // Test
        const testRoom = new Room({mapSize: testSize});
        testRoom.updateEnemyEntities(testEnemyArray);

        // Verification
        expect(testRoom.getEnemies[0]).toBe(testEnemy1);
        expect(testRoom.getEnemies[1]).toBe(testEnemy2);
        expect(testRoom.updateEnemies(1)).not.toThrowError;
    });
})