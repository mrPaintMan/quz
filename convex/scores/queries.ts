import { v } from "convex/values";
import { query } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import { scoresOfGame } from "./scoresOfGame";

// Public: the TV's leaderboards, the hosts' and each phone's own score. Counts only questions
// whose answer is out, so it reveals nothing early.
export const getScores = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => scoresOfGame(ctx, await getOrThrow(ctx, "games", gameId)),
});
