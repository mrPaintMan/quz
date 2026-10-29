import type { Timer } from "@convex/games/timer";

export function pauseTimer(timer: Timer, now: number): Timer {
  if (timer.kind === "paused") return timer;
  return { kind: "paused", remainingMs: Math.max(timer.endsAt - now, 0) };
}
