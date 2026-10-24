import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { atLobby, setupConvexTest } from "../test.setup";

describe("getRunningGame", () => {
  it("returns null when no game is running", async () => {
    const t = setupConvexTest();
    await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2025", year: 2025, updatedAt: 0 });
      await ctx.db.insert("games", { quizId, endedAt: 1, ...atLobby });
    });
    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toBeNull();
  });

  it("shows the running game's quiz title and screen, and nothing else of the quiz", async () => {
    const t = setupConvexTest();
    const gameId = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2026", year: 2026, updatedAt: 0 });
      return ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
    });
    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toEqual({
      _id: gameId,
      quizTitle: "Julquiz 2026",
      screen: { kind: "lobby" },
    });
  });
});
