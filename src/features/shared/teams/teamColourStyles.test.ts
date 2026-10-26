import { describe, expect, it } from "vitest";
import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import { TEAM_COLOUR_HEX, TEAM_COLOUR_NAMES } from "./teamColourStyles";

describe("team colour styles", () => {
  it("give every colour its own shade and name", () => {
    expect(new Set(TEAM_COLOURS.map((colour) => TEAM_COLOUR_HEX[colour])).size).toBe(TEAM_COLOURS.length);
    expect(new Set(TEAM_COLOURS.map((colour) => TEAM_COLOUR_NAMES[colour])).size).toBe(TEAM_COLOURS.length);
  });
});
