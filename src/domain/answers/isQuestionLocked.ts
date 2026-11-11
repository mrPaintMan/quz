import type { Id } from "@convex/_generated/dataModel";

type LockedState = { closedQuestionIds?: Id<"questions">[]; lockedQuestionIds?: Id<"questions">[] };

// Whether a question's answers are locked for good in a game: closed by Nästa (D41), or locked when
// every team had sent or its time ran out (D55). No team can answer it after that.
export function isQuestionLocked(game: LockedState, questionId: Id<"questions">): boolean {
  return (game.closedQuestionIds ?? []).includes(questionId) || (game.lockedQuestionIds ?? []).includes(questionId);
}
