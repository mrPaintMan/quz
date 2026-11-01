import type { Id } from "@convex/_generated/dataModel";

// The closed questions with this one added, each listed once.
export function closeQuestion(closed: Id<"questions">[] | undefined, questionId: Id<"questions">): Id<"questions">[] {
  const before = closed ?? [];
  return before.includes(questionId) ? before : [...before, questionId];
}
