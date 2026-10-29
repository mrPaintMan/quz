import { buildScreenSequence } from "@/domain/screenSequence/buildScreenSequence";
import { findScreenIndex } from "@/domain/screenSequence/findScreenIndex";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { roundsWithQuestionsOfQuiz } from "../rounds/roundsWithQuestionsOfQuiz";

// The quiz as it is now, the night's screens built from it, and where in them the game is.
export async function placeOfGame(ctx: QueryCtx, game: Doc<"games">) {
  const rounds = await roundsWithQuestionsOfQuiz(ctx, game.quizId);
  const sequence = buildScreenSequence(rounds);
  return { rounds, sequence, screenIndex: findScreenIndex(sequence, game.screen, game.screenIndex) };
}
