import { v } from "convex/values";

export const sortAnswer = v.object({
  type: v.literal("sort"),
  // The team's order, top first, as positions in the question's items (stored in the correct order).
  order: v.array(v.number()),
});
