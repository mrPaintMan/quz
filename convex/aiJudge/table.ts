import { defineTable } from "convex/server";
import { v } from "convex/values";

// How the AI judge is getting on with a question in a game, for the hosts' review list (D52).
export const aiJudgingsTable = defineTable({
  gameId: v.id("games"),
  questionId: v.id("questions"),
  status: v.union(v.literal("judging"), v.literal("done"), v.literal("failed")),
}).index("by_gameId_and_questionId", ["gameId", "questionId"]);
