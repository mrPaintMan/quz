import { ConvexError } from "convex/values";
import { isSameTimer } from "@/domain/timer/isSameTimer";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import type { Timer } from "./timer";

// Changes the timer the host saw, and does nothing if it has changed since (another press, or a
// step to another screen), so a double press or both hosts pressing at once counts once.
type TimerChange = (timer: Timer, now: number) => Timer;

export async function changeTimer(ctx: MutationCtx, gameId: Id<"games">, from: Timer, change: TimerChange) {
  const game = await getOrThrow(ctx, "games", gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  if (game.timer === undefined || !isSameTimer(game.timer, from)) return;
  await ctx.db.patch("games", gameId, { timer: change(game.timer, Date.now()) });
}
