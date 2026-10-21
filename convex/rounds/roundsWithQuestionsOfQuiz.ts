import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { questionsOfRound } from "../questions/questionsOfRound";
import { roundsOfQuiz } from "./roundsOfQuiz";

// A quiz's rounds in order, each with its questions in order.
export async function roundsWithQuestionsOfQuiz(ctx: QueryCtx, quizId: Id<"quizzes">) {
  const rounds = await roundsOfQuiz(ctx, quizId);
  return Promise.all(rounds.map(async (round) => ({ ...round, questions: await questionsOfRound(ctx, round._id) })));
}
