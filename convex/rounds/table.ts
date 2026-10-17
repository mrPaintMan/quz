import { defineTable } from "convex/server";
import { v } from "convex/values";

export const roundsTable = defineTable({
  quizId: v.id("quizzes"),
  position: v.number(),
  title: v.string(),
  kind: v.union(v.literal("questions"), v.literal("paSparet")),
}).index("by_quizId_and_position", ["quizId", "position"]);
