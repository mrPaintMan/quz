import { describe, expect, it } from "vitest";
import { setupConvexTest } from "../test.setup";
import { teamsOfGame } from "./teamsOfGame";

describe("teamsOfGame", () => {
  it("returns only the game's teams, in the order they joined", async () => {
    const t = setupConvexTest();
    const names = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null });
      const otherGameId = await ctx.db.insert("games", { quizId, endedAt: 1 });
      await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" });
      await ctx.db.insert("teams", { gameId: otherGameId, name: "Förra året", colour: "blue" });
      await ctx.db.insert("teams", { gameId, name: "Nissarna", colour: "green" });
      return (await teamsOfGame(ctx, gameId)).map((team) => team.name);
    });
    expect(names).toEqual(["Tomtarna", "Nissarna"]);
  });
});
