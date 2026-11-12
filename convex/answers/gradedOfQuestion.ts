import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { teamsOfGame } from "../teams/teamsOfGame";
import { verdictsOfQuestion } from "../verdicts/verdictsOfQuestion";
import { lockedAnswersOfQuestion } from "./lockedAnswersOfQuestion";

// A question's sent answers that still fit it, the verdicts on their texts, and the teams that sent
// them in the same order, for grading and for a reveal of what the teams answered (D53, D60). The
// verdicts and teams are read only when asked for, so a question that needs neither reads only its
// answers (D45). Also every sent answer, for picking one team's own.
export async function gradedOfQuestion(
  ctx: QueryCtx,
  gameId: Id<"games">,
  question: Doc<"questions">,
  needs: { verdicts: boolean; teams: boolean },
) {
  const [locked, teams, verdicts] = await Promise.all([
    lockedAnswersOfQuestion(ctx, gameId, question._id),
    needs.teams ? teamsOfGame(ctx, gameId) : Promise.resolve(null),
    needs.verdicts ? verdictsOfQuestion(ctx, gameId, question._id) : Promise.resolve([]),
  ]);
  const fitting = locked.flatMap((answer) => {
    const team = teams?.find((candidate) => candidate._id === answer.teamId);
    // Without the teams asked for, any team will do; with them, an answer whose team is gone drops out.
    return isAnswerFor(question.content, answer.content) && (teams === null || team) ? [{ answer: answer.content, team }] : [];
  });
  return {
    locked,
    graded: {
      answers: fitting.map(({ answer }) => answer),
      verdicts,
      teams: fitting.flatMap(({ team }) => (team ? [{ _id: team._id, name: team.name, colour: team.colour }] : [])),
    },
  };
}
