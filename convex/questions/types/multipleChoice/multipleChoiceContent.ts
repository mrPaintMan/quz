import { v } from "convex/values";

export const multipleChoiceContent = v.object({
  type: v.literal("multipleChoice"),
  options: v.array(
    v.object({
      text: v.string(),
      imageId: v.union(v.id("_storage"), v.null()),
    }),
  ),
  // null until the hosts pick the correct option.
  correctIndex: v.union(v.number(), v.null()),
  points: v.number(),
});
