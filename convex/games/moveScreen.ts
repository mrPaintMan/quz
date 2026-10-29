import { ConvexError } from "convex/values";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import { stepScreen } from "@/domain/screenSequence/stepScreen";
import { startTimerForScreen } from "@/domain/timer/startTimerForScreen";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import type { Screen } from "./screen";
import { placeOfGame } from "./placeOfGame";

// Steps from the screen the host saw, and does nothing if the game has already moved on, so a
// double press or both hosts pressing at once moves only one screen. A question's timer starts
// over each time the question shows, also when stepping back to it.
export async function moveScreen(ctx: MutationCtx, gameId: Id<"games">, from: Screen, step: 1 | -1) {
  const game = await getOrThrow(ctx, "games", gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
  if (!isSameScreen(sequence[screenIndex], from)) return;
  const position = stepScreen(sequence, game, step);
  await ctx.db.patch("games", gameId, { ...position, timer: startTimerForScreen(position.screen, rounds, Date.now()) });
}
