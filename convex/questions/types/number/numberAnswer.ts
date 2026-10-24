import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

export const numberAnswer = v.object({
  type: v.literal("number"),
  value: numberOrNull,
});
