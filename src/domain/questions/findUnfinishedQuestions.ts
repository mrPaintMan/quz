import type { Film } from "@convex/rounds/table";
import { type QuestionDraft, findQuestionProblems } from "@/domain/questions/findQuestionProblems";
import { filmOf } from "@/domain/rounds/filmOf";

type QuestionInRound = Omit<QuestionDraft, "film"> & { filmId?: string };
type RoundDraft<Q extends QuestionInRound> = { films?: Film[]; questions: Q[] };

// The questions that still need filling in, in quiz order; empty means the quiz can start (D20).
// A question asked after a film is ready only once its film is (D33).
export function findUnfinishedQuestions<Q extends QuestionInRound>(rounds: RoundDraft<Q>[]): Q[] {
  return rounds.flatMap((round) =>
    round.questions.filter((question) => findQuestionProblems({ ...question, film: filmOf(round, question)?.video }).length > 0),
  );
}
