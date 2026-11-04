import { describe, expect, it } from "vitest";
import { rankTeams } from "./rankTeams";

describe("rankTeams", () => {
  it("puts the most points first", () => {
    expect(rankTeams([{ name: "A", points: 3 }, { name: "B", points: 7 }]).map((team) => team.name)).toEqual(["B", "A"]);
  });

  it("gives teams on the same points the same place, and skips the places they share", () => {
    const ranked = rankTeams([
      { name: "A", points: 5 },
      { name: "B", points: 9 },
      { name: "C", points: 5 },
      { name: "D", points: 1 },
    ]);
    expect(ranked.map(({ name, rank }) => `${rank} ${name}`)).toEqual(["1 B", "2 A", "2 C", "4 D"]);
  });
});
