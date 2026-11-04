import { describe, expect, it } from "vitest";
import { sumScores } from "./sumScores";

const teams = [
  { _id: "red", name: "Röda" },
  { _id: "blue", name: "Blå" },
];

describe("sumScores", () => {
  it("adds each team's points and ranks the teams", () => {
    const scores = sumScores(teams, [
      { teamId: "red", points: 2 },
      { teamId: "blue", points: 3 },
      { teamId: "red", points: 5 },
    ]);
    expect(scores).toEqual([
      { _id: "red", name: "Röda", points: 7, rank: 1 },
      { _id: "blue", name: "Blå", points: 3, rank: 2 },
    ]);
  });

  it("lists a team with nothing yet on 0", () => {
    expect(sumScores(teams, []).map((team) => team.points)).toEqual([0, 0]);
  });

  it("rounds to hundredths, so decimal points add up as written and tie as they should", () => {
    const scores = sumScores(teams, [
      { teamId: "red", points: 0.1 },
      { teamId: "red", points: 0.2 },
      { teamId: "blue", points: 0.3 },
    ]);
    expect(scores.map(({ points, rank }) => `${rank} ${points}`)).toEqual(["1 0.3", "1 0.3"]);
  });
});
