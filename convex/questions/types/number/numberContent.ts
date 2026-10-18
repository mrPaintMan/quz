import { v } from "convex/values";
import { numberOrNull } from "../../numberOrNull";

const tierScoring = v.object({
  mode: v.literal("tiers"),
  tiers: v.array(v.object({ within: numberOrNull, points: numberOrNull })),
});

const closestScoring = v.object({
  mode: v.literal("closest"),
  pointsByRank: v.array(numberOrNull),
});

export const numberContent = v.object({
  type: v.literal("number"),
  // null until the hosts enter the correct answer.
  answer: numberOrNull,
  scoring: v.union(tierScoring, closestScoring),
});
