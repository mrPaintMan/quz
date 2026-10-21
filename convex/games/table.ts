import { defineTable } from "convex/server";
import { v } from "convex/values";

// At most one game runs at a time, so phones join it at quz.nu without a join word.
export const gamesTable = defineTable({
  quizId: v.id("quizzes"),
  // null while the game runs.
  endedAt: v.union(v.number(), v.null()),
})
  .index("by_endedAt", ["endedAt"])
  .index("by_quizId", ["quizId"]);
