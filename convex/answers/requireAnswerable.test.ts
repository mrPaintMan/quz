import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { requireAnswerable } from "./requireAnswerable";

describe("requireAnswerable", () => {
  it("gives the team's game and its draft so far for the question on the TV", async () => {
    const t = setupConvexTest();
    const result = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Siffror", kind: "questions" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Hur många?",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3] } },
      });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
      const teamId = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
      const content = { type: "number" as const, value: 7 };
      const draftId = await ctx.db.insert("answers", { gameId, teamId, questionId, content, lockedAt: null });
      const { game, answer } = await requireAnswerable(ctx, teamId, questionId, content);
      return { isGame: game._id === gameId, isDraft: answer?._id === draftId };
    });
    expect(result).toEqual({ isGame: true, isDraft: true });
  });

  it("refuses a question already closed by the hosts", async () => {
    const t = setupConvexTest();
    await expect(
      t.run(async (ctx) => {
        const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
        const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Siffror", kind: "questions" });
        const questionId = await ctx.db.insert("questions", {
          quizId,
          roundId,
          position: 0,
          prompt: "Hur många?",
          timeLimitSeconds: null,
          media: null,
          hostNotes: "",
          content: { type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3] } },
        });
        const screen = { kind: "question" as const, questionId };
        const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen, screenIndex: 3, closedQuestionIds: [questionId] });
        const teamId = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
        return requireAnswerable(ctx, teamId, questionId, { type: "number", value: 7 });
      }),
    ).rejects.toThrow("Frågan tar inte emot svar just nu.");
  });
});
