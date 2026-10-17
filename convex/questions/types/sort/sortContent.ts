import { v } from "convex/values";

export const sortContent = v.object({
  type: v.literal("sort"),
  // Stored in the correct order; phones shuffle them.
  items: v.array(v.string()),
  firstLabel: v.string(),
  lastLabel: v.string(),
  pointsPerItem: v.number(),
});
