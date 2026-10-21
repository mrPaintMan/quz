import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const multipleChoiceAnswer = v.object({
  type: v.literal("multipleChoice"),
  // The picked option's position in the question's options; null until one is picked.
  optionIndex: numberOrNull,
});
