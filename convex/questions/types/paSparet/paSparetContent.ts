import { v } from "convex/values";

// Exactly five clues, worth 10, 8, 6, 4 and 2 points in that order (D30).
export const paSparetContent = v.object({
  type: v.literal("paSparet"),
  acceptedAnswers: v.array(v.string()),
  fuzzy: v.boolean(),
  clues: v.array(v.string()),
});
