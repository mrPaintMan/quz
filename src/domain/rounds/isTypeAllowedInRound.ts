import type { QuestionType } from "@convex/questions/questionContent";
import type { RoundKind } from "@convex/rounds/table";

// A På spåret round holds only trips; every other type belongs in a question round.
export function isTypeAllowedInRound(roundKind: RoundKind, type: QuestionType): boolean {
  return (roundKind === "paSparet") === (type === "paSparet");
}
