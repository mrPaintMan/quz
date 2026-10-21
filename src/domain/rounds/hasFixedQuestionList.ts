import type { RoundKind } from "@convex/rounds/table";

// A På spåret round's questions are its trip, created with the round, and the questions asked
// after its films (D30, D32); they are added and removed through those, never as a free list.
export function hasFixedQuestionList(roundKind: RoundKind): boolean {
  return roundKind === "paSparet";
}
