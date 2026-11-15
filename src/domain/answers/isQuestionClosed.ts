import type { Id } from "@convex/_generated/dataModel";

// Whether the hosts have stepped on from a question in a game, closing it for good (D41): its
// scores count and its result shows on the phones; shown again, it offers no input.
export function isQuestionClosed(game: { closedQuestionIds?: Id<"questions">[] }, questionId: Id<"questions">): boolean {
  return (game.closedQuestionIds ?? []).includes(questionId);
}
