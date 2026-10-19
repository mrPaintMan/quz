import type { RoundKind } from "@convex/rounds/table";

// A På spåret round is one trip: it gets its trip when created and never more or fewer (D30).
export function holdsOneQuestion(roundKind: RoundKind): boolean {
  return roundKind === "paSparet";
}
