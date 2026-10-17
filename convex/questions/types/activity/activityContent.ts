import { v } from "convex/values";

// The question's prompt describes the activity; hosts enter points per team.
export const activityContent = v.object({
  type: v.literal("activity"),
  maxPoints: v.number(),
});
