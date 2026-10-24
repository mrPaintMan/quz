import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { atLobby, setupConvexTest } from "../test.setup";

async function setupTeam(endedAt: number | null) {
  const t = setupConvexTest();
  const { gameId, teamId } = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const gameId = await ctx.db.insert("games", { quizId, endedAt, ...atLobby });
    return { gameId, teamId: await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" }) };
  });
  return { t, gameId, teamId };
}

describe("listTeams", () => {
  it("shows each team's name and colour", async () => {
    const { t, gameId, teamId } = await setupTeam(null);
    await expect(t.query(api.teams.queries.listTeams, { gameId })).resolves.toEqual([{ _id: teamId, name: "Tomtarna", colour: "red" }]);
  });
});

describe("getTeam", () => {
  it("finds the phone's team while its game runs", async () => {
    const { t, teamId } = await setupTeam(null);
    await expect(t.query(api.teams.queries.getTeam, { teamId })).resolves.toMatchObject({ _id: teamId, name: "Tomtarna" });
  });

  it("returns null once the team's game has ended", async () => {
    const { t, teamId } = await setupTeam(1);
    await expect(t.query(api.teams.queries.getTeam, { teamId })).resolves.toBeNull();
  });

  it("returns null for an id that isn't a team here, such as one saved from another deployment", async () => {
    const { t, gameId, teamId } = await setupTeam(null);
    await t.run((ctx) => ctx.db.delete("teams", teamId));
    await expect(t.query(api.teams.queries.getTeam, { teamId })).resolves.toBeNull();
    await expect(t.query(api.teams.queries.getTeam, { teamId: gameId })).resolves.toBeNull();
    await expect(t.query(api.teams.queries.getTeam, { teamId: "inte-ett-id" })).resolves.toBeNull();
  });
});
