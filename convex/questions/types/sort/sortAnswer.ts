import { v } from "convex/values";

export const sortAnswer = v.object({
  type: v.literal("sort"),
  // The team's order, top first, as the items' texts. Texts rather than positions in the question's
  // items, which are stored in the right order and would give it away to the phone (D46).
  order: v.array(v.string()),
});
