import type { Timer } from "@convex/games/timer";

export function resumeTimer(timer: Timer, now: number): Timer {
  if (timer.kind === "running") return timer;
  return { kind: "running", endsAt: now + timer.remainingMs };
}
