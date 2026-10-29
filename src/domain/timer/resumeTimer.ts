import type { Timer } from "@convex/games/timer";

// Resuming a running timer changes nothing, so both hosts pressing at once is harmless.
export function resumeTimer(timer: Timer, now: number): Timer {
  if (timer.kind === "running") return timer;
  return { kind: "running", endsAt: now + timer.remainingMs };
}
