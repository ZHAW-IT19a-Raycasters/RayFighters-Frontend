import { Map2D, MapElement, MapElementType } from "../src/map2d";
import { Point2D } from "../src/point2d";

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
    map.setElem(new Point2D(0, 0), new MapElement(MapElementType.FLOOR));
    map.setElem(new Point2D(0, 1), new MapElement(MapElementType.FLOOR));
    map.setElem(new Point2D(1, 0), new MapElement(MapElementType.WALL));
    map.setElem(new Point2D(1, 1), new MapElement(MapElementType.WALL));

    let el00 = map.getElem(new Point2D(0, 0));
    let el01 = map.getElem(new Point2D(0, 1));
    let el10 = map.getElem(new Point2D(1, 0));
    let el11 = map.getElem(new Point2D(1, 1));

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
    expect(function() {map.getElem(new Point2D(-1, 1))}).toThrowError("No MapElement at (-1,1).");
    expect(function() {map.getElem(new Point2D(-1, -3))}).toThrowError("No MapElement at (-1,-3).");
    // btw: function() {} is a workaround to get toThrowError working with jasmine
  });

  it('should correctly handle getting elements at fractional coordinates', () => {
    let map = new Map2D(16);
    map.setElem(new Point2D(0.55123, 8 + 1E-6), new MapElement(MapElementType.FLOOR));

    let elem = map.getElem(new Point2D(0, 8));
    try {
      expect(elem.getType()).toBe(MapElementType.FLOOR);
    } catch (error) {
      fail("Map2D doesn't correctly handle fractional x, y coordinates (like x=3.14 or y = 0.88).");
    }
  });
});
