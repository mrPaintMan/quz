import type { Timer } from "@convex/games/timer";

// Whole seconds left, rounded up, so the clock shows 0 only once the time is out.
export function secondsLeft(timer: Timer, now: number): number {
  const remainingMs = timer.kind === "running" ? timer.endsAt - now : timer.remainingMs;
  return Math.ceil(Math.max(remainingMs, 0) / 1000);
}
