import { describe, expect, it } from "vitest";
import { borderDetailForZoom } from "./borderDetailForZoom";

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
