import { describe, expect, it } from "vitest";
import { parseDecimal } from "./parseDecimal";

describe("parseDecimal", () => {
  it("parses whole numbers and decimals with a point or a comma", () => {
    expect(parseDecimal("3")).toBe(3);
    expect(parseDecimal("0.5")).toBe(0.5);
    expect(parseDecimal(" 0,5 ")).toBe(0.5);
  });

  it.each(["", "  ", "tre"])("gives NaN for %j", (text) => {
    expect(parseDecimal(text)).toBeNaN();
  });
});
