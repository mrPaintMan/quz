import type { Timer } from "@convex/games/timer";

// A phone's countdown and the network can lag the server by a second or so, so answers are
// accepted this long after the server's zero; drafts lock after it (D41).
export const ANSWER_GRACE_MS = 2000;

// Whether a question's time is out for answering; a question without a timer never times out.
export function isTimeOut(timer: Timer | undefined, now: number): boolean {
  if (timer === undefined) return false;
  if (timer.kind === "paused") return timer.remainingMs <= 0;
  return now > timer.endsAt + ANSWER_GRACE_MS;
}
