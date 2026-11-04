import { gradeAnswer } from "@/domain/scoring/gradeAnswer";
import { sumScores } from "@/domain/scoring/sumScores";
import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { MAX_ADJUSTMENTS_PER_GAME } from "../games/deleteGame";
import { teamsOfGame } from "../teams/teamsOfGame";

// The points of each locked answer to the questions closed so far (D41), so no score gives an
// answer away before its answer screen, and the teams' drafts on the open question don't touch
// this read.
async function pointsFromClosedQuestions(ctx: QueryCtx, game: Doc<"games">) {
  const graded = await Promise.all(
    (game.closedQuestionIds ?? []).map(async (questionId) => {
      // A question deleted during the game no longer scores (D34).
      const question = await ctx.db.get("questions", questionId);
      if (question === null) return [];
      const answers = await ctx.db
        .query("answers")
        .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", game._id).eq("questionId", questionId))
        .take(TEAM_COLOURS.length);
      return answers
        .filter((answer) => answer.lockedAt !== null)
        .map((answer) => ({ teamId: answer.teamId, points: gradeAnswer(question.content, answer.content) }));
    }),
  );
  return graded.flat();
}

// The teams ranked by their score, summed from their answers and the hosts' points, never stored (D6).
export async function scoresOfGame(ctx: QueryCtx, game: Doc<"games">) {
  const teams = await teamsOfGame(ctx, game._id);
  const adjustments = await ctx.db
    .query("adjustments")
    .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
    .take(MAX_ADJUSTMENTS_PER_GAME);
  const earned = [...(await pointsFromClosedQuestions(ctx, game)), ...adjustments];
  return sumScores(
    teams.map(({ _id, name, colour }) => ({ _id, name, colour })),
    earned,
  );
}
