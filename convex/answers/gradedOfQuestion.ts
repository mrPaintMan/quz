import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { teamsOfGame } from "../teams/teamsOfGame";
import { verdictsOfQuestion } from "../verdicts/verdictsOfQuestion";
import { lockedAnswersOfQuestion } from "./lockedAnswersOfQuestion";

// A question's sent answers that still fit it, with the teams that sent them in the same order and
// the verdicts on their texts, for a reveal of what the teams answered (D53, D60). Also every sent
// answer with its team, for picking one team's own.
export async function gradedOfQuestion(ctx: QueryCtx, gameId: Id<"games">, question: Doc<"questions">) {
  const [locked, teams, verdicts] = await Promise.all([
    lockedAnswersOfQuestion(ctx, gameId, question._id),
    teamsOfGame(ctx, gameId),
    verdictsOfQuestion(ctx, gameId, question._id),
  ]);
  const fitting = locked.flatMap((answer) => {
    const team = teams.find((candidate) => candidate._id === answer.teamId);
    return team && isAnswerFor(question.content, answer.content) ? [{ answer: answer.content, team }] : [];
  });
  return {
    locked,
    graded: {
      answers: fitting.map(({ answer }) => answer),
      verdicts,
      teams: fitting.map(({ team }) => ({ _id: team._id, name: team.name, colour: team.colour })),
    },
  };
}
