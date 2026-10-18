import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const matchContent = v.object({
  type: v.literal("match"),
  // Stored as correct pairs; phones shuffle the right-hand side.
  pairs: v.array(v.object({ left: v.string(), right: v.string() })),
  pointsPerPair: numberOrNull,
});
