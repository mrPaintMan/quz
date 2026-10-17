import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { roundsOfQuiz } from "./roundsOfQuiz";

describe("roundsOfQuiz", () => {
  it("returns only the quiz's rounds, ordered by position", async () => {
    const t = setupConvexTest();
    const titles = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "A", year: 2026, updatedAt: 0 });
      const otherQuizId = await ctx.db.insert("quizzes", { title: "B", year: 2026, updatedAt: 0 });
      await ctx.db.insert("rounds", { quizId, position: 1, title: "Andra", kind: "questions" });
      await ctx.db.insert("rounds", { quizId, position: 0, title: "Första", kind: "questions" });
      await ctx.db.insert("rounds", { quizId: otherQuizId, position: 0, title: "Annat quiz", kind: "questions" });
      return (await roundsOfQuiz(ctx, quizId)).map((round) => round.title);
    });
    expect(titles).toEqual(["Första", "Andra"]);
  });
});
