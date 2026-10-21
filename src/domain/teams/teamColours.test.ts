import { describe, expect, it } from "vitest";
import { TEAM_COLOURS } from "./teamColours";

describe("TEAM_COLOURS", () => {
  it("has 12 different colours, so up to 12 teams can play", () => {
    expect(new Set(TEAM_COLOURS).size).toBe(12);
  });
});
