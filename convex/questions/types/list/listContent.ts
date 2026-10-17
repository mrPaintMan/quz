import { v } from "convex/values";
import { acceptedItem } from "../../acceptedItem";

export const listContent = v.object({
  type: v.literal("list"),
  // May be empty for open lists; unknown items go to review (and the AI judge when enabled).
  acceptedItems: v.array(acceptedItem),
  pointsPerItem: v.number(),
  fuzzy: v.boolean(),
  aiAssist: v.boolean(),
});
