import { v } from "convex/values";

export const freeTextContent = v.object({
  type: v.literal("freeText"),
  fields: v.array(
    v.object({
      label: v.string(),
      acceptedAnswers: v.array(v.string()),
    }),
  ),
  pointsPerField: v.number(),
  fuzzy: v.boolean(),
});
