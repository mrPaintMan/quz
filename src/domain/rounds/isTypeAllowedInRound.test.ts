import { describe, expect, it } from "vitest";
import { isTypeAllowedInRound } from "./isTypeAllowedInRound";

describe("isTypeAllowedInRound", () => {
  it("allows På spåret trips only in På spåret rounds", () => {
    expect(isTypeAllowedInRound("paSparet", "paSparet")).toBe(true);
    expect(isTypeAllowedInRound("questions", "paSparet")).toBe(false);
  });

  it("allows other types only in question rounds", () => {
    expect(isTypeAllowedInRound("questions", "activity")).toBe(true);
    expect(isTypeAllowedInRound("paSparet", "activity")).toBe(false);
  });
});
