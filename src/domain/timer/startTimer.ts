import type { Timer } from "@convex/games/timer";

// A question without a time limit has no timer.
export function startTimer(timeLimitSeconds: number | null, now: number): Timer | undefined {
  if (timeLimitSeconds === null || timeLimitSeconds <= 0) return undefined;
  return { kind: "running", endsAt: now + timeLimitSeconds * 1000 };
}
