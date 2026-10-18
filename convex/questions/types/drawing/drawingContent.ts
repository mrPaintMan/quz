import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const drawingContent = v.object({
  type: v.literal("drawing"),
  maxPoints: numberOrNull,
});
