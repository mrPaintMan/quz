import { gradeAnswer } from "@/domain/scoring/gradeAnswer";
import { rankTeams } from "@/domain/scoring/rankTeams";
import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { teamsOfGame } from "../teams/teamsOfGame";

// More than any night's bonuses and activity scores; a bound for the read, as Convex asks.
const MAX_ADJUSTMENTS = 1000;

// Each team's points from the questions closed so far (D41), so no score gives an answer away
// before its answer screen, and the teams' drafts on the open question don't touch this read.
async function pointsFromClosedQuestions(ctx: QueryCtx, game: Doc<"games">): Promise<Map<Id<"teams">, number>> {
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
  const points = new Map<Id<"teams">, number>();
  for (const { teamId, points: earned } of graded.flat()) points.set(teamId, (points.get(teamId) ?? 0) + earned);
  return points;
}

// The teams ranked by their score, summed from their answers and the hosts' points, never stored (D6).
export async function scoresOfGame(ctx: QueryCtx, game: Doc<"games">) {
  const teams = await teamsOfGame(ctx, game._id);
  const points = await pointsFromClosedQuestions(ctx, game);
  const adjustments = await ctx.db
    .query("adjustments")
    .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
    .take(MAX_ADJUSTMENTS);
  for (const adjustment of adjustments) {
    points.set(adjustment.teamId, (points.get(adjustment.teamId) ?? 0) + adjustment.points);
  }
  return rankTeams(teams.map(({ _id, name, colour }) => ({ _id, name, colour, points: points.get(_id) ?? 0 })));
}
