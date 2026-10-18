import { describe, expect, it } from "vitest";
import { highestPoints } from "./highestPoints";

describe("highestPoints", () => {
  it("gives the best score on offer, or 0 for none", () => {
    expect(highestPoints([2, 10, 6])).toBe(10);
    expect(highestPoints([])).toBe(0);
  });

  it("is null while any of the points isn't filled in", () => {
    expect(highestPoints([10, null])).toBeNull();
  });
});
