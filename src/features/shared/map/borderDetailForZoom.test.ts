import { describe, expect, it } from "vitest";
import { borderDetailForZoom } from "./borderDetailForZoom";

describe("borderDetailForZoom", () => {
  it.each([
    [1, "110m"],
    [4.75, "110m"],
    [5, "50m"],
    [8.75, "50m"],
    [9, "10m"],
    [12, "10m"],
  ])("draws zoom %s with the %s borders", (zoom, detail) => {
    expect(borderDetailForZoom(zoom)).toBe(detail);
  });
});
