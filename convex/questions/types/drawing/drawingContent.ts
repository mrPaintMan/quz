import { v } from "convex/values";

export const drawingContent = v.object({
  type: v.literal("drawing"),
  maxPoints: v.number(),
});
