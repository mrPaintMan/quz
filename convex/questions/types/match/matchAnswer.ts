import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const matchAnswer = v.object({
  type: v.literal("match"),
  // For each left-hand item, the position of the right-hand item it was joined to, or null.
  rightIndexByLeft: v.array(numberOrNull),
});
