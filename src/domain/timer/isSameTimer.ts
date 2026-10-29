import type { Timer } from "@convex/games/timer";

// Timers are equal when they would show the same countdown.
export function isSameTimer(a: Timer, b: Timer): boolean {
  if (a.kind === "running" && b.kind === "running") return a.endsAt === b.endsAt;
  if (a.kind === "paused" && b.kind === "paused") return a.remainingMs === b.remainingMs;
  return false;
}
