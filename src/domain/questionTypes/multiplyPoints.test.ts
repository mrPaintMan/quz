import { describe, expect, it } from "vitest";
import { multiplyPoints } from "./multiplyPoints";

describe("multiplyPoints", () => {
  it("gives the points for every right answer", () => {
    expect(multiplyPoints(4, 1.5)).toBe(6);
  });

  it("is null while the points aren't filled in", () => {
    expect(multiplyPoints(4, null)).toBeNull();
  });
});
