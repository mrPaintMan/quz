import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { changeTimer } from "./changeTimer";

const pauseAtOneSecond = () => ({ kind: "paused" as const, remainingMs: 1_000 });

describe("changeTimer", () => {
  it("saves the changed timer", async () => {
    const t = setupConvexTest();
    const game = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby, timer: { kind: "running", endsAt: 5 } });
      await changeTimer(ctx, gameId, pauseAtOneSecond);
      return ctx.db.get("games", gameId);
    });
    expect(game?.timer).toEqual({ kind: "paused", remainingMs: 1_000 });
  });

  it("leaves a game without a timer as it is", async () => {
    const t = setupConvexTest();
    const game = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      await changeTimer(ctx, gameId, pauseAtOneSecond);
      return ctx.db.get("games", gameId);
    });
    expect(game?.timer).toBeUndefined();
  });
});
