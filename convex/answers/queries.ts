import { v } from "convex/values";
import { answeringOf, reviewOf } from "@/domain/answering/registry";
import { feedbackQuestionId } from "@/domain/answers/feedbackQuestionId";
import { outcomesOfAnswers } from "@/domain/scoring/gradeAnswers";
import { query } from "../_generated/server";
import { verdictsOfQuestion } from "../verdicts/verdictsOfQuestion";
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

// Public, for the team's own phone: what its answer to the question last shown with its answer
// counted as, part by part, and its points (D58). Shown from that answer screen until the next
// question; it follows verdicts as they change. null before any answer is out, while a question
// shows, and for a question not answered in the app; outcome is null when the team didn't answer.
export const getTeamFeedback = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.db.get("teams", teamId);
    const game = team && (await ctx.db.get("games", team.gameId));
    const questionId = game && game.endedAt === null ? feedbackQuestionId(game) : null;
    const question = questionId && (await ctx.db.get("questions", questionId));
    if (!game || !question || !answeringOf(question.content) || !(game.closedQuestionIds ?? []).includes(question._id)) return null;
    const locked = await lockedAnswersOfQuestion(ctx, game._id, question._id);
    const verdicts = reviewOf(question.content) === null ? [] : await verdictsOfQuestion(ctx, game._id, question._id);
    const outcomes = outcomesOfAnswers(
      question.content,
      locked.map((answer) => answer.content),
      verdicts,
    );
    const index = locked.findIndex((answer) => answer.teamId === teamId);
    return { prompt: question.prompt, outcome: index === -1 ? null : outcomes[index] };
  },
});

