import type { Screen } from "./screen";
import { buildScreenSequence } from "@/domain/screenSequence/buildScreenSequence";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { roundsWithQuestionsOfQuiz } from "../rounds/roundsWithQuestionsOfQuiz";

// Built from the quiz as it is now, so edits during the game show up at once (D34).
export async function screenSequenceOfQuiz(ctx: QueryCtx, quizId: Id<"quizzes">): Promise<Screen[]> {
  return buildScreenSequence(await roundsWithQuestionsOfQuiz(ctx, quizId));
}
