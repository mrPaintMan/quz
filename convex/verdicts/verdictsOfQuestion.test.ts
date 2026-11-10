import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

describe("verdictsOfQuestion", () => {
  it("gives the verdicts on one question in one game", async () => {
    const t = setupConvexTest();
    const verdicts = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const question = { quizId, roundId, position: 0, prompt: "Vilken krydda?", timeLimitSeconds: null, media: null, hostNotes: "" };
      const content = { type: "freeText" as const, fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
      const questionId = await ctx.db.insert("questions", { ...question, content });
      const otherQuestionId = await ctx.db.insert("questions", { ...question, position: 1, content });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      const otherGameId = await ctx.db.insert("games", { quizId, endedAt: 1, ...atLobby });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "safran", target: 0 });
      await ctx.db.insert("verdicts", { gameId, questionId: otherQuestionId, slot: 0, text: "kanel", target: null });
      await ctx.db.insert("verdicts", { gameId: otherGameId, questionId, slot: 0, text: "saffron", target: 0 });
      return verdictsOfQuestion(ctx, gameId, questionId);
    });
    expect(verdicts).toEqual([{ slot: 0, text: "safran", target: 0 }]);
  });
});
