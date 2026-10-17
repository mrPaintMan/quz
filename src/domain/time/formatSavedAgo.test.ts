import { describe, expect, it } from "vitest";
import { formatSavedAgo } from "./formatSavedAgo";

const now = 1_000_000_000;
const minutes = (count: number) => count * 60_000;

describe("formatSavedAgo", () => {
  it.each([
    [0, "Sparat just nu"],
    [minutes(0.5), "Sparat just nu"],
    [minutes(2), "Sparat för 2 min sedan"],
    [minutes(150), "Sparat för 2 h sedan"],
    [minutes(60 * 24), "Sparat för 1 dag sedan"],
    [minutes(60 * 24 * 3), "Sparat för 3 dagar sedan"],
  ])("describes %i ms ago as %j", (elapsed, text) => {
    expect(formatSavedAgo(now - elapsed, now)).toBe(text);
  });

  it("treats a save time slightly in the future as just now", () => {
    expect(formatSavedAgo(now + 500, now)).toBe("Sparat just nu");
  });
});
