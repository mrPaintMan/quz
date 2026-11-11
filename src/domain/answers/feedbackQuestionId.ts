import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";

// The question whose result the phones show (D58): the one on the answer screen, or on the screens
// after it the last one closed; none while a question shows, nor before any is closed.
export function feedbackQuestionId(game: { screen: Screen; closedQuestionIds?: Id<"questions">[] }): Id<"questions"> | null {
  if (game.screen.kind === "question") return null;
  if (game.screen.kind === "answer") return game.screen.questionId;
  return game.closedQuestionIds?.at(-1) ?? null;
}
