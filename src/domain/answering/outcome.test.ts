import { describe, expect, it } from "vitest";
import { pointsOf } from "./outcome";

describe("pointsOf", () => {
  it("gives each outcome's points in order", () => {
    expect(pointsOf([{ points: 2, parts: [] }, { points: 0, parts: [] }])).toEqual([2, 0]);
  });
});
