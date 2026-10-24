import { v } from "convex/values";

export const ingredientsAnswer = v.object({
  type: v.literal("ingredients"),
  // One text per field on the phone; order doesn't matter.
  items: v.array(v.string()),
});
