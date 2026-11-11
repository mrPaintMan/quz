// Where a question stands in a game's judging, decided in one place (D55):
// - open: teams may still answer;
// - judging: the answers are locked and the AI judge is at work on texts no one has judged;
// - reviewing: the AI judge is done (or failed) and texts are left for the hosts;
// - settled: nothing is left to judge, or the question has no AI judge to wait for.
export type QuestionPhase = "open" | "judging" | "reviewing" | "settled";

type PhaseFacts = {
  // Whether the answers are locked: every team has sent, the time is out, or Nästa closed it.
  isLocked: boolean;
  // Whether the question's unmatched texts go to the AI judge (usesAiJudge).
  usesAiJudge: boolean;
  // The AI judge's own status, or null if it was never asked.
  aiStatus: "judging" | "done" | "failed" | null;
  // How many sent texts matched no spelling and have no verdict yet.
  unjudged: number;
};

export function questionPhase({ isLocked, usesAiJudge, aiStatus, unjudged }: PhaseFacts): QuestionPhase {
  if (!isLocked) return "open";
  // Once every text is judged, by the AI or by the hosts, nothing is waited for, even if the AI
  // judge never reports back.
  if (!usesAiJudge || unjudged === 0) return "settled";
  return aiStatus === "judging" ? "judging" : "reviewing";
}

// Nästa waits while answers are being judged, so the answer screen and the scores are final when
// they show (D55). An open question may be stepped on from: that locks it, and judging starts.
export function canStepOn(phase: QuestionPhase): boolean {
  return phase === "open" || phase === "settled";
}
