import type { Timer } from "@convex/games/timer";

// Pausing a paused timer changes nothing, so both hosts pressing at once is harmless.
export function pauseTimer(timer: Timer, now: number): Timer {
  if (timer.kind === "paused") return timer;
  return { kind: "paused", remainingMs: Math.max(timer.endsAt - now, 0) };
}
