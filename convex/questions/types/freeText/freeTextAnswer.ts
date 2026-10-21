import { v } from "convex/values";

export const freeTextAnswer = v.object({
  type: v.literal("freeText"),
  // One text per field of the question, in the same order.
  fields: v.array(v.string()),
});
