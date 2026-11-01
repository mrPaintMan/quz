import { isSameTimer } from "@/domain/timer/isSameTimer";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { scheduleTimeOutLock } from "../answers/timeOut";
import { requireRunningGame } from "./requireRunningGame";
import type { Timer } from "./timer";

// Changes the timer the host saw, and does nothing if it has changed since (another press, or a
// step to another screen), so a double press or both hosts pressing at once counts once. The lock
// at the time's end moves with the timer.
type TimerChange = (timer: Timer, now: number) => Timer;

export async function changeTimer(ctx: MutationCtx, gameId: Id<"games">, from: Timer, change: TimerChange) {
  const game = await requireRunningGame(ctx, gameId);
  if (game.timer === undefined || !isSameTimer(game.timer, from)) return;
  const timer = change(game.timer, Date.now());
  await ctx.db.patch("games", gameId, { timer });
  await scheduleTimeOutLock(ctx, { ...game, timer });
}
