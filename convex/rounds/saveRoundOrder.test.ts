import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { roundsOfQuiz } from "./roundsOfQuiz";
import { saveRoundOrder } from "./saveRoundOrder";

describe("saveRoundOrder", () => {
  it("stores each round's index in the list as its position", async () => {
    const t = setupConvexTest();
    const titles = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "A", year: 2026, updatedAt: 0 });
      await ctx.db.insert("rounds", { quizId, position: 0, title: "Första", kind: "questions" });
      await ctx.db.insert("rounds", { quizId, position: 1, title: "Andra", kind: "questions" });
      const [first, second] = await roundsOfQuiz(ctx, quizId);
      await saveRoundOrder(ctx, [second, first]);
      return (await roundsOfQuiz(ctx, quizId)).map((round) => round.title);
    });
    expect(titles).toEqual(["Andra", "Första"]);
  });
});
