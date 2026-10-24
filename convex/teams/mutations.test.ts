import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { setupConvexTest } from "../test.setup";

async function setupGame(endedAt: number | null = null) {
  const t = setupConvexTest();
  const gameId = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    return ctx.db.insert("games", { quizId, endedAt });
  });
  return { t, gameId };
}

describe("joinGame", () => {
  it("adds the team with its name trimmed", async () => {
    const { t, gameId } = await setupGame();
    const teamId = await t.mutation(api.teams.mutations.joinGame, { gameId, name: "  Tomtarna ", colour: "red" });
    await expect(t.query(api.teams.queries.listTeams, { gameId })).resolves.toEqual([{ _id: teamId, name: "Tomtarna", colour: "red" }]);
  });

  it("refuses a name or colour another team already has", async () => {
    const { t, gameId } = await setupGame();
    await t.mutation(api.teams.mutations.joinGame, { gameId, name: "Tomtarna", colour: "red" });
    await expect(t.mutation(api.teams.mutations.joinGame, { gameId, name: "tomtarna", colour: "blue" })).rejects.toThrow(
      "Ett annat lag heter redan så.",
    );
    await expect(t.mutation(api.teams.mutations.joinGame, { gameId, name: "Nissarna", colour: "red" })).rejects.toThrow(
      "Ett annat lag har redan den färgen.",
    );
  });

  it("refuses a game that has ended", async () => {
    const { t, gameId } = await setupGame(1);
    await expect(t.mutation(api.teams.mutations.joinGame, { gameId, name: "Tomtarna", colour: "red" })).rejects.toThrow(
      "Quizet är slut.",
    );
  });
});
