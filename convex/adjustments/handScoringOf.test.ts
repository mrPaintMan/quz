import { describe, expect, it } from "vitest";
import { atActivity, atDrawing } from "./handPoints.setup";
import { handScoringOf } from "./handScoringOf";

describe("handScoringOf", () => {
  it("scores every team on an activity, with its most points", async () => {
    const { t, gameId, questionId, red, blue } = await atActivity();
    const scoring = await t.run(async (ctx) => handScoringOf(ctx, gameId, (await ctx.db.get("questions", questionId))!));
    expect(scoring).toEqual({ maxPoints: 5, teams: [{ teamId: red, points: null }, { teamId: blue, points: null }] });
  });

  it("scores only the teams that drew something, leaving out a paper that locked empty", async () => {
    const { t, gameId, drawingId, blue, red } = await atDrawing();
    const scoring = await t.run(async (ctx) => {
      await ctx.db.insert("answers", { gameId, teamId: blue, questionId: drawingId, content: { type: "drawing", strokes: [] }, lockedAt: 2 });
      return handScoringOf(ctx, gameId, (await ctx.db.get("questions", drawingId))!);
    });
    expect(scoring).toEqual({ maxPoints: 3, teams: [{ teamId: red, points: null }] });
  });

  it("gives nothing for a question the app scores", async () => {
    const { t, gameId, quizId, roundId } = await atActivity();
    const scoring = await t.run(async (ctx) => {
      const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 2, prompt: "Hur många?", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } } });
      return handScoringOf(ctx, gameId, (await ctx.db.get("questions", questionId))!);
    });
    expect(scoring).toBeNull();
  });
});
