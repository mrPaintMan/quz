import { describe, expect, it } from "vitest";
import { parseDecimal } from "./parseDecimal";

describe("parseDecimal", () => {
  it("parses whole numbers and decimals with a point or a comma", () => {
    expect(parseDecimal("3")).toBe(3);
    expect(parseDecimal("0.5")).toBe(0.5);
    expect(parseDecimal(" 0,5 ")).toBe(0.5);
  });

  it("ignores spaces between thousands", () => {
    expect(parseDecimal("8 500 000")).toBe(8_500_000);
    expect(parseDecimal("1\u00a0250,5")).toBe(1250.5);
  });

  it.each(["", "  ", "tre", "Infinity"])("gives null for %j", (text) => {
    expect(parseDecimal(text)).toBeNull();
  });
});
