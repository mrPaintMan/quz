import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { roundsWithQuestionsOfQuiz } from "./roundsWithQuestionsOfQuiz";

describe("roundsWithQuestionsOfQuiz", () => {
  it("returns the quiz's rounds in order, each with its own questions", async () => {
    const t = setupConvexTest();
    const rounds = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const second = await ctx.db.insert("rounds", { quizId, position: 1, title: "Andra", kind: "questions" });
      await ctx.db.insert("rounds", { quizId, position: 0, title: "Första", kind: "questions" });
      await ctx.db.insert("questions", {
        quizId,
        roundId: second,
        position: 0,
        prompt: "Pepparkakshus",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "activity", maxPoints: 1 },
      });
      return roundsWithQuestionsOfQuiz(ctx, quizId);
    });
    expect(rounds.map((round) => [round.title, round.questions.map((question) => question.prompt)])).toEqual([
      ["Första", []],
      ["Andra", ["Pepparkakshus"]],
    ]);
  });
});
