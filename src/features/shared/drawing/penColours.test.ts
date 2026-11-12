import { describe, expect, it } from "vitest";
import { PENS, penHex } from "./penColours";

describe("penColours", () => {
  it("offers five pens, black first", () => {
    expect(PENS.map((pen) => pen.name)).toEqual(["Svart", "Röd", "Grön", "Blå", "Orange"]);
  });

  it("gives a pen's ink, falling back to black", () => {
    expect(penHex("blue")).toBe("#2f62d6");
    expect(penHex("gold" as never)).toBe("#1f1a24");
  });
});
