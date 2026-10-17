import { v } from "convex/values";

export const multipleChoiceContent = v.object({
  type: v.literal("multipleChoice"),
  options: v.array(
    v.object({
      text: v.string(),
      imageId: v.union(v.id("_storage"), v.null()),
    }),
  ),
  correctIndex: v.number(),
  points: v.number(),
});
