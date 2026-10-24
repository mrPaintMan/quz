import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { screenSequenceOfQuiz } from "./screenSequenceOfQuiz";

describe("screenSequenceOfQuiz", () => {
  it("builds the screens from the quiz's rounds and questions", async () => {
    const t = setupConvexTest();
    const { roundId, questionId, sequence } = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Lekar", kind: "questions" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Pepparkakshus",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "activity", maxPoints: 5 },
      });
      return { roundId, questionId, sequence: await screenSequenceOfQuiz(ctx, quizId) };
    });
    expect(sequence).toEqual([
      { kind: "lobby" },
      { kind: "rules" },
      { kind: "roundIntro", roundId },
      { kind: "question", questionId },
      { kind: "finalLeaderboard" },
    ]);
  });
});
