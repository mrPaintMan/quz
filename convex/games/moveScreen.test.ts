import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { moveScreen } from "./moveScreen";

describe("moveScreen", () => {
  it("saves the new screen with its place in the sequence", async () => {
    const t = setupConvexTest();
    const game = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      await moveScreen(ctx, gameId, { kind: "lobby" }, 1);
      return ctx.db.get("games", gameId);
    });
    expect(game).toMatchObject({ screen: { kind: "rules" }, screenIndex: 1 });
  });

  it("does nothing when the game has already moved on from the screen the host saw", async () => {
    const t = setupConvexTest();
    const game = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      await moveScreen(ctx, gameId, { kind: "lobby" }, 1);
      await moveScreen(ctx, gameId, { kind: "lobby" }, 1);
      return ctx.db.get("games", gameId);
    });
    expect(game).toMatchObject({ screen: { kind: "rules" }, screenIndex: 1 });
  });
});
