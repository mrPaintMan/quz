import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";
import { acceptedItem } from "../../acceptedItem";

export const ingredientsContent = v.object({
  type: v.literal("ingredients"),
  // One answer field per item on the phone; order doesn't matter.
  items: v.array(acceptedItem),
  pointsPerItem: numberOrNull,
  fuzzy: v.boolean(),
});
