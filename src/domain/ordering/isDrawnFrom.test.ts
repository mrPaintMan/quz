import { describe, expect, it } from "vitest";
import { isDrawnFrom } from "./isDrawnFrom";

describe("isDrawnFrom", () => {
  it("accepts texts on offer, a repeated one as often as offered", () => {
    expect(isDrawnFrom(["ABBA", "Roxette"], ["Roxette", "ABBA", "Europe"])).toBe(true);
    expect(isDrawnFrom(["ABBA", "ABBA"], ["ABBA", "ABBA", "Europe"])).toBe(true);
  });

  it("refuses a text not on offer, or used more often than offered", () => {
    expect(isDrawnFrom(["Kent"], ["ABBA"])).toBe(false);
    expect(isDrawnFrom(["ABBA", "ABBA"], ["ABBA", "Europe"])).toBe(false);
  });

  it("isn't fooled by texts with line breaks", () => {
    expect(isDrawnFrom(["a", "b\nc"], ["a\nb", "c"])).toBe(false);
  });
});
