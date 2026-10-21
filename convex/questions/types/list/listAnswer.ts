import { v } from "convex/values";

export const listAnswer = v.object({
  type: v.literal("list"),
  items: v.array(v.string()),
});
