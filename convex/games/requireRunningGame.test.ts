import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { requireRunningGame } from "./requireRunningGame";

async function insertGame(t: ReturnType<typeof setupConvexTest>, endedAt: number | null) {
  return t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    return ctx.db.insert("games", { quizId, endedAt, ...atLobby });
  });
}

describe("requireRunningGame", () => {
  it("gives the running game", async () => {
    const t = setupConvexTest();
    const gameId = await insertGame(t, null);
    await expect(t.run((ctx) => requireRunningGame(ctx, gameId))).resolves.toMatchObject({ _id: gameId });
  });

  it("refuses a game that has ended", async () => {
    const t = setupConvexTest();
    const gameId = await insertGame(t, 1);
    await expect(t.run((ctx) => requireRunningGame(ctx, gameId))).rejects.toThrow("Quizet är slut.");
  });
});
