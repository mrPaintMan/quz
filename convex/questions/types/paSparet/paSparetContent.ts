import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

// Clues saved before D30 carried their own points. Accepted only until
// migratePaSparetClues has turned them into plain text on every deployment.
const legacyClue = v.object({ text: v.string(), points: numberOrNull });

// Exactly five clues, worth 10, 8, 6, 4 and 2 points in that order (D30).
export const paSparetContent = v.object({
  type: v.literal("paSparet"),
  acceptedAnswers: v.array(v.string()),
  fuzzy: v.boolean(),
  clues: v.array(v.union(v.string(), legacyClue)),
});
