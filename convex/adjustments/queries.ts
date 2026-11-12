import { v } from "convex/values";
import { query } from "../_generated/server";
import { hostQuery } from "../auth/hostFunctions";
import { MAX_ADJUSTMENTS_PER_GAME } from "../games/deleteGame";
import { activityPointsOf } from "./activityPointsOf";

// Host-only: an activity's most points and each team's points so far, for the hosts to set (D61);
// null for a question that isn't an activity.
export const getActivityPoints = hostQuery({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    const question = await ctx.db.get("questions", questionId);
    if (question?.content.type !== "activity") return null;
    const given = await activityPointsOf(ctx, gameId, questionId);
    return { maxPoints: question.content.maxPoints, teams: given.map(({ teamId, points }) => ({ teamId, points })) };
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

// Public, for the team's own phone: its points for the activity on the TV now, once the hosts have
// given them; null otherwise (D61).
export const getTeamActivityPoints = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.db.get("teams", teamId);
    const game = team && (await ctx.db.get("games", team.gameId));
    if (!game || game.endedAt !== null || game.screen.kind !== "question") return null;
    const own = (await activityPointsOf(ctx, game._id, game.screen.questionId)).find((adjustment) => adjustment.teamId === teamId);
    return own?.points ?? null;
  },
});
