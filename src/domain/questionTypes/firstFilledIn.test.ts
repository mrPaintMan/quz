import { describe, expect, it } from "vitest";
import { firstFilledIn } from "./firstFilledIn";

describe("firstFilledIn", () => {
  it("skips blank texts and trims the first filled-in one", () => {
    expect(firstFilledIn(["", "  ", " Kanel ", "kanelstång"])).toBe("Kanel");
  });

  it("is empty when nothing is filled in", () => {
    expect(firstFilledIn([" "])).toBe("");
    expect(firstFilledIn([])).toBe("");
  });
});
