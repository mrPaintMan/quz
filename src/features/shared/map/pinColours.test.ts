import { describe, expect, it } from "vitest";
import { PIN_GOLD } from "./pinColours";

describe("PIN_GOLD", () => {
  it("is the theme's gold as a value an SVG fill can use", () => {
    expect(PIN_GOLD).toMatch(/^#[0-9a-f]{6}$/);
  });
});
