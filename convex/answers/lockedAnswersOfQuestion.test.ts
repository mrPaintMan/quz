import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { lockedAnswersOfQuestion } from "./lockedAnswersOfQuestion";

describe("lockedAnswersOfQuestion", () => {
  it("gives the sent answers to one question in one game, never drafts", async () => {
    const t = setupConvexTest();
    const answers = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const question = { quizId, roundId, position: 0, prompt: "Hur många?", timeLimitSeconds: null, media: null, hostNotes: "" };
      const content = { type: "number" as const, answer: 3, scoring: { mode: "closest" as const, pointsByRank: [1] } };
      const questionId = await ctx.db.insert("questions", { ...question, content });
      const otherQuestionId = await ctx.db.insert("questions", { ...question, position: 1, content });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      const team = (name: string, colour: "red" | "blue") => ctx.db.insert("teams", { gameId, name, colour });
      const [red, blue] = [await team("Röda", "red"), await team("Blå", "blue")];
      await ctx.db.insert("answers", { gameId, teamId: red, questionId, content: { type: "number", value: 4 }, lockedAt: 1 });
      await ctx.db.insert("answers", { gameId, teamId: blue, questionId, content: { type: "number", value: 2 }, lockedAt: null });
      await ctx.db.insert("answers", { gameId, teamId: blue, questionId: otherQuestionId, content: { type: "number", value: 5 }, lockedAt: 1 });
      return lockedAnswersOfQuestion(ctx, gameId, questionId);
    });
    expect(answers.map((answer) => answer.content)).toEqual([{ type: "number", value: 4 }]);
  });
});
