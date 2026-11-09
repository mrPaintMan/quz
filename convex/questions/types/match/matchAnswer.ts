import { v } from "convex/values";

export const matchAnswer = v.object({
  type: v.literal("match"),
  // For each left-hand item, in the question's order, the text of the right-hand item joined to
  // it, or null. Texts rather than positions, as the right-hand items are stored in the right
  // order and positions would give the pairs away to the phone (D47).
  rightByLeft: v.array(v.union(v.string(), v.null())),
});
