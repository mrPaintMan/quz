import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const freeTextContent = v.object({
  type: v.literal("freeText"),
  fields: v.array(
    v.object({
      label: v.string(),
      acceptedAnswers: v.array(v.string()),
    }),
  ),
  pointsPerField: numberOrNull,
  fuzzy: v.boolean(),
});
