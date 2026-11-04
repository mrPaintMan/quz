import { v } from "convex/values";
import { query } from "../_generated/server";
import { scoresOfGame } from "./scoresOfGame";

// Public: the TV's leaderboards, the hosts' and each phone's own score. Counts only questions
// whose answer is out, so it reveals nothing early. Empty for a game that is gone, so the screens
// following it fall back to their own no-game state instead of failing.
export const getScores = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get("games", gameId);
    return game === null ? [] : scoresOfGame(ctx, game);
  },
});
