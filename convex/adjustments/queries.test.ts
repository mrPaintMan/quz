import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host } from "../test.setup";
import { atActivity } from "./manualPoints.setup";

describe("getActivityPoints", () => {
  it("gives the activity's most points and each team's points so far", async () => {
    const { t, gameId, questionId, red } = await atActivity();
    await t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: red, points: 4 });
    await expect(t.query(api.adjustments.queries.getActivityPoints, { ...host, gameId, questionId })).resolves.toEqual({ maxPoints: 5, teams: [{ teamId: red, points: 4 }] });
  });

  it("gives nothing for a question that isn't an activity", async () => {
    const { t, gameId, quizId, roundId } = await atActivity();
    const questionId = await t.run((ctx) =>
      ctx.db.insert("questions", { quizId, roundId, position: 1, prompt: "Hur många?", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } } }),
    );
    await expect(t.query(api.adjustments.queries.getActivityPoints, { ...host, gameId, questionId })).resolves.toBeNull();
  });
});

describe("listCorrections", () => {
  it("gives the corrections newest first, leaving out activities' points", async () => {
    const { t, gameId, questionId, red, blue } = await atActivity();
    await t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: red, points: 4 });
    await t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: red, points: 1 });
    await t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: blue, points: -2 });
    const corrections = await t.query(api.adjustments.queries.listCorrections, { ...host, gameId });
    expect(corrections.map(({ teamId, points }) => [teamId, points])).toEqual([
      [blue, -2],
      [red, 1],
    ]);
  });
});

describe("getTeamActivityPoints", () => {
  it("gives the team its own points for the activity once given, and nothing before", async () => {
    const { t, gameId, questionId, red, blue } = await atActivity();
    await expect(t.query(api.adjustments.queries.getTeamActivityPoints, { teamId: red, questionId })).resolves.toBeNull();
    await t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: red, points: 4 });
    await expect(t.query(api.adjustments.queries.getTeamActivityPoints, { teamId: red, questionId })).resolves.toBe(4);
    await expect(t.query(api.adjustments.queries.getTeamActivityPoints, { teamId: blue, questionId })).resolves.toBeNull();
  });

  it("gives nothing for a team that is gone", async () => {
    const { t, questionId, red } = await atActivity();
    await t.run((ctx) => ctx.db.delete("teams", red));
    await expect(t.query(api.adjustments.queries.getTeamActivityPoints, { teamId: red, questionId })).resolves.toBeNull();
  });
});
