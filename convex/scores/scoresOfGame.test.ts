import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { scoresOfGame } from "./scoresOfGame";

describe("scoresOfGame", () => {
  it("gives every team of the game, on 0 points before anything has scored", async () => {
    const t = setupConvexTest();
    const scores = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "lobby" }, screenIndex: 0 });
      await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
      return scoresOfGame(ctx, (await ctx.db.get("games", gameId))!);
    });
    expect(scores).toEqual([{ _id: expect.any(String), name: "Röda", colour: "red", points: 0, rank: 1 }]);
  });
});
