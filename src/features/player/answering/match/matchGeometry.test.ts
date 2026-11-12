import { describe, expect, it } from "vitest";
import { curveBetween, listsHeight } from "./matchGeometry";

describe("matchGeometry", () => {
  it("draws a level S-curve between the middles of two rows", () => {
    expect(curveBetween(0, 1)).toBe("M -2 32 C 20 32, 20 108, 42 108");
  });

  it("gives the height of the lists without a gap after the last row", () => {
    expect(listsHeight(3)).toBe(216);
  });
});
