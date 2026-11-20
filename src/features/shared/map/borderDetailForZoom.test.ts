import { describe, expect, it } from "vitest";
import { borderDetailForZoom, showsRegions } from "./borderDetailForZoom";

describe("borderDetailForZoom", () => {
  it.each([
    [1, "50m"],
    [5.75, "50m"],
    [6, "10m"],
    [12, "10m"],
  ])("draws zoom %s with the %s borders", (zoom, detail) => {
    expect(borderDetailForZoom(zoom)).toBe(detail);
  });
});

describe("showsRegions", () => {
  it.each([
    [3.75, false],
    [4, true],
    [12, true],
  ])("at zoom %s: %s", (zoom, shown) => {
    expect(showsRegions(zoom)).toBe(shown);
  });
});
