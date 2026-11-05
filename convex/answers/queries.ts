import { v } from "convex/values";
import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import { query } from "../_generated/server";

// Public, for the team's own phone: its answer to the question so far, and whether it is locked.
export const getTeamAnswer = query({
  args: { teamId: v.id("teams"), questionId: v.id("questions") },
  handler: async (ctx, { teamId, questionId }) => {
    const answer = await ctx.db
      .query("answers")
      .withIndex("by_teamId_and_questionId", (q) => q.eq("teamId", teamId).eq("questionId", questionId))
      .unique();
    return answer && { content: answer.content, isLocked: answer.lockedAt !== null };
  },
});

// Public: which teams have sent, or had locked, an answer to the question. The TV shows only how
// many; the hosts see who. The answers themselves stay hidden until they are revealed.
export const getAnsweredTeamIds = query({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    // Drafts sort before every lock time (null first), so this range holds only locked answers.
    const answers = await ctx.db
      .query("answers")
      .withIndex("by_gameId_and_questionId_and_lockedAt", (q) =>
        q.eq("gameId", gameId).eq("questionId", questionId).gt("lockedAt", null),
      )
      .take(TEAM_COLOURS.length);
    return answers.map((answer) => answer.teamId);
  },
});
