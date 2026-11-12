import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { gradedOfQuestion } from "./gradedOfQuestion";

describe("gradedOfQuestion", () => {
  it("gives the sent answers that fit, with their teams in the same order, and the verdicts", async () => {
    const t = setupConvexTest();
    const result = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const content = { type: "freeText" as const, fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
      const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Vilken krydda?", timeLimitSeconds: null, media: null, hostNotes: "", content });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "answer", questionId }, screenIndex: 4, closedQuestionIds: [questionId] });
      const red = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
      const blue = await ctx.db.insert("teams", { gameId, name: "Blå", colour: "blue" });
      await ctx.db.insert("answers", { gameId, teamId: red, questionId, content: { type: "freeText", fields: ["Safran"] }, lockedAt: 1 });
      await ctx.db.insert("answers", { gameId, teamId: blue, questionId, content: { type: "number", value: 3 }, lockedAt: 1 });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "safran", target: 0 });
      const { locked, graded } = await gradedOfQuestion(ctx, gameId, (await ctx.db.get("questions", questionId))!);
      return { lockedCount: locked.length, graded };
    });
    expect(result.lockedCount).toBe(2);
    expect(result.graded).toMatchObject({
      answers: [{ type: "freeText", fields: ["Safran"] }],
      verdicts: [{ slot: 0, text: "safran", target: 0 }],
      teams: [{ name: "Röda", colour: "red" }],
    });
  });
});
