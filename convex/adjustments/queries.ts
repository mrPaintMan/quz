import { v } from "convex/values";
import { query } from "../_generated/server";
import { hostQuery } from "../auth/hostFunctions";
import { MAX_ADJUSTMENTS_PER_GAME } from "../games/deleteGame";
import { handPointsOf, handScoringOf } from "./handPointsOf";

// Host-only: the teams the hosts score by hand on a question, each with its points so far or null,
// and the question's most points (D61, D62); null for a question the app scores.
export const getHandPoints = hostQuery({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    const question = await ctx.db.get("questions", questionId);
    return question && handScoringOf(ctx, gameId, question);
  },
});

// Host-only: the corrections made so far, newest first, for the hosts to see and take back (D61).
export const listCorrections = hostQuery({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const corrections = await ctx.db
      .query("adjustments")
      .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", gameId).eq("questionId", null))
      .order("desc")
      .take(MAX_ADJUSTMENTS_PER_GAME);
    return corrections.map(({ _id, teamId, points }) => ({ _id, teamId, points }));
  },
});

// Public, for the team's own phone on an activity's screen: its points for that activity once the
// hosts have given them; null otherwise (D61). Reads only the team and the activity's points, so
// the game's timer and playback don't rerun it.
export const getTeamHandPoints = query({
  args: { teamId: v.id("teams"), questionId: v.id("questions") },
  handler: async (ctx, { teamId, questionId }) => {
    const team = await ctx.db.get("teams", teamId);
    if (!team) return null;
    const own = (await handPointsOf(ctx, team.gameId, questionId)).find((adjustment) => adjustment.teamId === teamId);
    return own?.points ?? null;
  },
});
