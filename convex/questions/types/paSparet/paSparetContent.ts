import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const paSparetContent = v.object({
  type: v.literal("paSparet"),
  acceptedAnswers: v.array(v.string()),
  fuzzy: v.boolean(),
  clues: v.array(v.object({ text: v.string(), points: numberOrNull })),
});
