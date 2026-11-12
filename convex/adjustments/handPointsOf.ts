import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { rulesFor } from "@/domain/questionTypes/registry";
import { isScoredByHand } from "@/domain/scoring/isScoredByHand";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { lockedAnswersOfQuestion } from "../answers/lockedAnswersOfQuestion";
import { teamsOfGame } from "../teams/teamsOfGame";

// The points the hosts gave by hand for a question in a game, at most one per team (D61, D62).
export function handPointsOf(ctx: QueryCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  return ctx.db
    .query("adjustments")
    .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", gameId).eq("questionId", questionId))
    .take(TEAM_COLOURS.length);
}

// The teams the hosts score by hand on a question, each with its points so far or null, and the
// question's most points; null for a question scored by the app. An activity scores every team;
// a drawing the teams that sent one (D62).
export async function handScoringOf(ctx: QueryCtx, gameId: Id<"games">, question: Doc<"questions">) {
  const { content } = question;
  if (!isScoredByHand(content)) return null;
  const [given, teamIds] = await Promise.all([
    handPointsOf(ctx, gameId, question._id),
    content.type === "activity"
      ? teamsOfGame(ctx, gameId).then((teams) => teams.map((team) => team._id))
      : lockedAnswersOfQuestion(ctx, gameId, question._id).then((answers) =>
          answers.filter((answer) => isAnswerFor(content, answer.content)).map((answer) => answer.teamId),
        ),
  ]);
  return {
    maxPoints: rulesFor(content).maxPoints(content),
    teams: teamIds.map((teamId) => ({ teamId, points: given.find((adjustment) => adjustment.teamId === teamId)?.points ?? null })),
  };
}
