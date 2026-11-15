import { describe, expect, it } from "vitest";
import { formatNumber } from "./formatNumber";

// Swedish grouping uses a no-break space; compared here as a plain one.
const plain = (text: string) => text.replace(/\s/g, " ");

describe("formatNumber", () => {
  it("groups the whole part in threes, and keeps a decimal comma", () => {
    expect(plain(formatNumber(4500000))).toBe("4 500 000");
    expect(plain(formatNumber(1234.5))).toBe("1 234,5");
    expect(formatNumber(999)).toBe("999");
  });

  it("writes out numbers too big for plain digits", () => {
    expect(plain(formatNumber(1e21))).toBe("1 000 000 000 000 000 000 000");
  });
});
