import { ConvexError } from "convex/values";
import { findScreenIndex } from "@/domain/screenSequence/findScreenIndex";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import { stepScreen } from "@/domain/screenSequence/stepScreen";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import type { Screen } from "./screen";
import { screenSequenceOfQuiz } from "./screenSequenceOfQuiz";

// Steps from the screen the host saw, and does nothing if the game has already moved on, so a
// double press or both hosts pressing at once moves only one screen.
export async function moveScreen(ctx: MutationCtx, gameId: Id<"games">, from: Screen, step: 1 | -1) {
  const game = await getOrThrow(ctx, "games", gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  const sequence = await screenSequenceOfQuiz(ctx, game.quizId);
  if (!isSameScreen(sequence[findScreenIndex(sequence, game.screen, game.screenIndex)], from)) return;
  await ctx.db.patch("games", gameId, stepScreen(sequence, game, step));
}
