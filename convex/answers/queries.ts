import { v } from "convex/values";
import { query } from "../_generated/server";
import { lockedAnswersOfQuestion } from "./lockedAnswersOfQuestion";

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
    const answers = await lockedAnswersOfQuestion(ctx, gameId, questionId);
    return answers.map((answer) => answer.teamId);
  },
});
