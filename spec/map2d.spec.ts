import { Vec2D } from "../src/common/vec2d";
import { Map2D, MapElement, MapElementType } from "../src/maps/map2d";

describe('Testing Map2D methods', () => {
  it('should generate the map array to be square of "size"', () => {
    const size = 32; //< 32x32 map
    let map = new Map2D(size);
    /**
     *    map size = size * size
     * => size = sqrt(map size)
     */
    expect(Math.sqrt(map.getElementCount)).toBe(size);
  });

  it('should correctly set and get map elements', () => {
    let map = new Map2D(2);
    /*
     Test Map:
     F W
     F W
    */
    map.setElement(new Vec2D(0, 0), new MapElement(MapElementType.FLOOR));
    map.setElement(new Vec2D(0, 1), new MapElement(MapElementType.FLOOR));
    map.setElement(new Vec2D(1, 0), new MapElement(MapElementType.WALL));
    map.setElement(new Vec2D(1, 1), new MapElement(MapElementType.WALL));

    let el00 = map.getElementByPosition(new Vec2D(0, 0));
    let el01 = map.getElementByPosition(new Vec2D(0, 1));
    let el10 = map.getElementByPosition(new Vec2D(1, 0));
    let el11 = map.getElementByPosition(new Vec2D(1, 1));

    try {
      // Test map getters of existing walls/floors
      expect(el00.getType()).toBe(MapElementType.FLOOR);
      expect(el01.getType()).toBe(MapElementType.FLOOR);
      expect(el10.getType()).toBe(MapElementType.WALL);
      expect(el11.getType()).toBe(MapElementType.WALL);
    } catch (error) {
      fail("Map2D.getElem() is unable to correctly return MapElements.");
    }

    // Test map getters of elements outside of the map
    expect(map.getElementByPosition(new Vec2D(-1, 1)).getType()).toBe(MapElementType.NONE);
    expect(map.getElementByPosition(new Vec2D(-1, -3)).getType()).toBe(MapElementType.NONE);
  });

  it('should correctly handle getting elements at fractional coordinates', () => {
    let map = new Map2D(16);
    map.setElement(new Vec2D(0.55123, 8 + 1E-6), new MapElement(MapElementType.FLOOR));

    let elem = map.getElementByPosition(new Vec2D(0, 8));
    try {
      expect(elem.getType()).toBe(MapElementType.FLOOR);
    } catch (error) {
      fail("Map2D doesn't correctly handle fractional x, y coordinates (like x=3.14 or y = 0.88).");
    }
  });

  it('should be able to raycast outside of the map', () => {
    const maxSteps = 4;
    const rayOrigin = new Vec2D(1.5, 1.5);
    const rayAngle = -0.5 * Math.PI; // looking straight up
    const map = new Map2D(4); // 4x4 map
    map.initialize(); // Map with no walls
    const steps = map.rayCast(rayOrigin, rayAngle, maxSteps);

    expect(steps.length).toBe(maxSteps + 2);
    expect(steps[0].pos).toEqual(rayOrigin);
    expect(steps[0].mapElement.getType()).toBe(MapElementType.NONE);
    expect(steps[1].pos).toEqual(new Vec2D(rayOrigin.x, 1));
    expect(steps[1].mapElement.getType()).toBe(MapElementType.FLOOR);
    expect(steps[2].pos).toEqual(new Vec2D(rayOrigin.x, 0));
    expect(steps[2].mapElement.getType()).toBe(MapElementType.NONE);
    expect(steps[3].pos).toEqual(new Vec2D(rayOrigin.x, -1));
    expect(steps[3].mapElement.getType()).toBe(MapElementType.NONE);
    expect(steps[4].pos).toEqual(new Vec2D(rayOrigin.x, -2));
    expect(steps[4].mapElement.getType()).toBe(MapElementType.NONE);
  });

  it('should raycast and hit a wall', () => {
    const maxSteps = 4;
    const rayOrigin = new Vec2D(3.5, 3.5); // we're on the bottom right of the map
    const rayAngle = -0.75 * Math.PI; // looking up-left (135°)
    const map = new Map2D(4); // 4x4 map
    map.initialize(); // Map with no walls
    // Put a wall at the top left:
    map.setElement(new Vec2D(1, 0), new MapElement(MapElementType.WALL));
    const steps = map.rayCast(rayOrigin, rayAngle, maxSteps);

    expect(steps.length <= maxSteps + 1).toBeTruthy();
    expect(steps[0].pos).toEqual(rayOrigin);
    expect(steps[0].mapElement.getType()).toBe(MapElementType.NONE);
    expect(steps[1].pos).toEqual(new Vec2D(3, 3));
    expect(steps[1].mapElement.getType()).toBe(MapElementType.FLOOR);
    expect(steps[2].pos).toEqual(new Vec2D(2, 2));
    expect(steps[2].mapElement.getType()).toBe(MapElementType.FLOOR);
    expect(steps[3].pos).toEqual(new Vec2D(1, 1));
    expect(steps[3].mapElement.getType()).toBe(MapElementType.WALL);
  });

  it('should provide a string through toString', () => {
    const expected = "   0 1 \n" +  
                   "0 [1 1]\n" +
                   "1 [1 0]\n";
    const map = new Map2D(2);
    map.setElement(new Vec2D(0, 0), new MapElement(MapElementType.WALL));
    map.setElement(new Vec2D(0, 1), new MapElement(MapElementType.WALL));
    map.setElement(new Vec2D(1, 0), new MapElement(MapElementType.WALL));
    map.setElement(new Vec2D(1, 1), new MapElement(MapElementType.FLOOR));
    expect(map.toString()).toBe(expected);
  });
  /*
  it('should read map from a file', () => {
    //TODO
    const map = new Map2D(2);
    map.fromText('TODO');
    let el00 = map.getElementByPosition(new Vec2D(0, 0));
    let el10 = map.getElementByPosition(new Vec2D(1, 0));
    let el01 = map.getElementByPosition(new Vec2D(0, 1));
    let el11 = map.getElementByPosition(new Vec2D(1, 1));
    expect(el00.getType()).toBe(MapElementType.FLOOR);
    expect(el10.getType()).toBe(MapElementType.FLOOR);
    expect(el01.getType()).toBe(MapElementType.FLOOR);
    expect(el11.getType()).toBe(MapElementType.FLOOR);
  });
  */
});
