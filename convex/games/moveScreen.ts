import { ConvexError } from "convex/values";
import { stepScreen } from "@/domain/screenSequence/stepScreen";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import { screenSequenceOfQuiz } from "./screenSequenceOfQuiz";

export async function moveScreen(ctx: MutationCtx, gameId: Id<"games">, step: 1 | -1) {
  const game = await getOrThrow(ctx, "games", gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  const sequence = await screenSequenceOfQuiz(ctx, game.quizId);
  await ctx.db.patch("games", gameId, stepScreen(sequence, game, step));
}
