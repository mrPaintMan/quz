import { v } from "convex/values";
import { query } from "../_generated/server";
import { teamsOfGame } from "./teamsOfGame";

// Public: the lobby on the TV and the join screen show who has joined.
export const listTeams = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const teams = await teamsOfGame(ctx, gameId);
    return teams.map(({ _id, name, colour }) => ({ _id, name, colour }));
  },
});

// For a phone rejoining after a refresh. The id comes from the phone's storage, so it may be
// from another deployment or an ended game; either way the phone joins anew.
export const getTeam = query({
  args: { teamId: v.string() },
  handler: async (ctx, args) => {
    const teamId = ctx.db.normalizeId("teams", args.teamId);
    const team = teamId === null ? null : await ctx.db.get("teams", teamId);
    if (team === null) return null;
    const game = await ctx.db.get("games", team.gameId);
    return game?.endedAt === null ? team : null;
  },
});
