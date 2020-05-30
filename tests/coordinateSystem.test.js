import expect from "expect";
import CoordinateSystem from "../src/coordinateSystem";

describe("CoordinateSystem", () => {
  let subject;

  beforeEach(() => {
    subject = new CoordinateSystem({
      scaleExtents: { min: 0, max: 100 },
      documentSize: { width: 10, height: 10 }
    });
    subject.canvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 10, bottom: 10 }),
    };
  });

  describe("#scaleAtClientPoint", () => {
    it("pans the view to keep the mouse point fixed when zooming in", () => {
      const actual = subject.scaleAtClientPoint(1, { clientX: 5, clientY: 5 });

      const expectedX = -5;
      const expectedY = -5;

      expect(Math.abs(expectedX - actual.x)).toBeLessThan(0.00001);
      expect(Math.abs(expectedY - actual.y)).toBeLessThan(0.00001);
    });

    it("pans the view to keep the mouse point fixed when zooming out", () => {
      const actual = subject.scaleAtClientPoint(-0.5, { clientX: 5, clientY: 5 });

      const expectedX = 2.5;
      const expectedY = 2.5;

      expect(Math.abs(expectedX - actual.x)).toBeLessThan(0.00001);
      expect(Math.abs(expectedY - actual.y)).toBeLessThan(0.00001);
    });
  });
});