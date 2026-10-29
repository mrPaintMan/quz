import type { Timer } from "@convex/games/timer";

export const TIMER_EXTENSION_SECONDS = 15;
const EXTENSION_MS = TIMER_EXTENSION_SECONDS * 1000;

// Counts from now once the time is out, so the extension always gives the full 15 seconds.
export function extendTimer(timer: Timer, now: number): Timer {
  if (timer.kind === "paused") return { kind: "paused", remainingMs: timer.remainingMs + EXTENSION_MS };
  return { kind: "running", endsAt: Math.max(timer.endsAt, now) + EXTENSION_MS };
}
