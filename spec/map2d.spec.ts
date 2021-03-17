import { Map2D, MapElement, MapElementType } from "../src/map2d";

describe('Testing Map2D methods', () => {
  it('should generate the map array to be square of "size"', () => {
    const size = 32; //< 32x32 map
    let map = new Map2D(size);
    /**
     *    map size = size * size
     * => size = sqrt(map size)
     */
    expect(Math.sqrt(map.getElementCount())).toBe(size);
  });

  it('should correctly set and get map elements', () => {
    let map = new Map2D(2);
    /*
     Test Map:
     F W
     F W
    */
    map.setElem(0, 0, new MapElement(MapElementType.FLOOR));
    map.setElem(0, 1, new MapElement(MapElementType.FLOOR));
    map.setElem(1, 0, new MapElement(MapElementType.WALL));
    map.setElem(1, 1, new MapElement(MapElementType.WALL));

    let el00 = map.getElem(0, 0);
    let el01 = map.getElem(0, 1);
    let el10 = map.getElem(1, 0);
    let el11 = map.getElem(1, 1);

    if(el00 instanceof MapElement &&
      el01 instanceof MapElement &&
      el10 instanceof MapElement &&
      el11 instanceof MapElement) {
      // Test map getters of existing walls/floors
      expect(el00.getType()).toBe(MapElementType.FLOOR);
      expect(el01.getType()).toBe(MapElementType.FLOOR);
      expect(el10.getType()).toBe(MapElementType.WALL);
      expect(el11.getType()).toBe(MapElementType.WALL);
    } else {
      fail("Map2D.getElem() is unable to correctly return MapElements.");
    }

    // Test map getters of elements outside of the map
    let elemOutsideMap = map.getElem(-1, 1);
    expect(elemOutsideMap).toBe(MapElementType.NONE);
    let elemOutsideMap2 = map.getElem(-1, -3);
    expect(elemOutsideMap2).toBe(MapElementType.NONE);

    if(elemOutsideMap instanceof MapElement || elemOutsideMap2 instanceof MapElement) {
      fail("Map2D.getElem() erronously returns an element at coordinates where there is none. Should return MapElementType.NONE.");
    }
  });
});
