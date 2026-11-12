import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host } from "../test.setup";
import { atActivity, atDrawing } from "./handPoints.setup";

describe("getHandPoints", () => {
  it("gives an activity's most points and every team's points so far", async () => {
    const { t, gameId, questionId, red, blue } = await atActivity();
    await t.mutation(api.adjustments.mutations.setHandPoints, { ...host, gameId, questionId, teamId: red, points: 4 });
    await expect(t.query(api.adjustments.queries.getHandPoints, { ...host, gameId, questionId })).resolves.toEqual({
      maxPoints: 5,
      teams: [
        { teamId: red, points: 4 },
        { teamId: blue, points: null },
      ],
    });
  });

  it("gives nothing for a question that isn't an activity", async () => {
    const { t, gameId, quizId, roundId } = await atActivity();
    const questionId = await t.run((ctx) =>
      ctx.db.insert("questions", { quizId, roundId, position: 1, prompt: "Hur många?", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } } }),
    );
    await expect(t.query(api.adjustments.queries.getHandPoints, { ...host, gameId, questionId })).resolves.toBeNull();
  });
});

describe("getHandPoints on a drawing", () => {
  it("gives only the teams that sent a drawing", async () => {
    const { t, gameId, drawingId, red } = await atDrawing();
    await expect(t.query(api.adjustments.queries.getHandPoints, { ...host, gameId, questionId: drawingId })).resolves.toEqual({ maxPoints: 3, teams: [{ teamId: red, points: null }] });
  });
});

describe("listCorrections", () => {
  it("gives the corrections newest first, leaving out activities' points", async () => {
    const { t, gameId, questionId, red, blue } = await atActivity();
    await t.mutation(api.adjustments.mutations.setHandPoints, { ...host, gameId, questionId, teamId: red, points: 4 });
    await t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: red, points: 1 });
    await t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: blue, points: -2 });
    const corrections = await t.query(api.adjustments.queries.listCorrections, { ...host, gameId });
    expect(corrections.map(({ teamId, points }) => [teamId, points])).toEqual([
      [blue, -2],
      [red, 1],
    ]);
  });
});

describe("getTeamHandPoints", () => {
  it("gives the team its own points for the activity once given, and nothing before", async () => {
    const { t, gameId, questionId, red, blue } = await atActivity();
    await expect(t.query(api.adjustments.queries.getTeamHandPoints, { teamId: red, questionId })).resolves.toBeNull();
    await t.mutation(api.adjustments.mutations.setHandPoints, { ...host, gameId, questionId, teamId: red, points: 4 });
    await expect(t.query(api.adjustments.queries.getTeamHandPoints, { teamId: red, questionId })).resolves.toBe(4);
    await expect(t.query(api.adjustments.queries.getTeamHandPoints, { teamId: blue, questionId })).resolves.toBeNull();
  });

  it("gives nothing for a team that is gone", async () => {
    const { t, questionId, red } = await atActivity();
    await t.run((ctx) => ctx.db.delete("teams", red));
    await expect(t.query(api.adjustments.queries.getTeamHandPoints, { teamId: red, questionId })).resolves.toBeNull();
  });
});
