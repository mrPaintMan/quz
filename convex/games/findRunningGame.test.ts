import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { findRunningGame } from "./findRunningGame";

describe("findRunningGame", () => {
  it("finds the game that hasn't ended, not the ended ones", async () => {
    const t = setupConvexTest();
    const { runningId, found } = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      await ctx.db.insert("games", { quizId, endedAt: 1, ...atLobby });
      const runningId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      return { runningId, found: await findRunningGame(ctx) };
    });
    expect(found?._id).toBe(runningId);
  });
});
