import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { gamesOfQuiz } from "./gamesOfQuiz";

describe("gamesOfQuiz", () => {
  it("returns only the quiz's games", async () => {
    const t = setupConvexTest();
    const { gameIds, found } = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "A", year: 2026, updatedAt: 0 });
      const otherQuizId = await ctx.db.insert("quizzes", { title: "B", year: 2026, updatedAt: 0 });
      const gameIds = [await ctx.db.insert("games", { quizId, endedAt: 1, ...atLobby }), await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby })];
      await ctx.db.insert("games", { quizId: otherQuizId, endedAt: 1, ...atLobby });
      return { gameIds, found: (await gamesOfQuiz(ctx, quizId)).map((game) => game._id) };
    });
    expect(found).toEqual(gameIds);
  });
});
