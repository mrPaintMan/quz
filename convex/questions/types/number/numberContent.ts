import { v } from "convex/values";

const tierScoring = v.object({
  mode: v.literal("tiers"),
  tiers: v.array(v.object({ within: v.number(), points: v.number() })),
});

const closestScoring = v.object({
  mode: v.literal("closest"),
  pointsByRank: v.array(v.number()),
});

export const numberContent = v.object({
  type: v.literal("number"),
  answer: v.number(),
  scoring: v.union(tierScoring, closestScoring),
});
