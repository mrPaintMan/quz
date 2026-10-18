import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

// The question's prompt describes the activity; hosts enter points per team.
export const activityContent = v.object({
  type: v.literal("activity"),
  maxPoints: numberOrNull,
});
