import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";

// Stepping on from a question closes it for good: its answer comes next, so stepping back must
// not let anyone answer after seeing it (D41). Stepping back from it doesn't close it.
export function questionClosedByStep(from: Screen, step: 1 | -1): Id<"questions"> | null {
  return from.kind === "question" && step === 1 ? from.questionId : null;
}
