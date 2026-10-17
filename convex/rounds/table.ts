import { defineTable } from "convex/server";
import { v, type Infer } from "convex/values";

export const roundKind = v.union(v.literal("questions"), v.literal("paSparet"));
export type RoundKind = Infer<typeof roundKind>;

export const roundsTable = defineTable({
  quizId: v.id("quizzes"),
  position: v.number(),
  title: v.string(),
  kind: roundKind,
}).index("by_quizId_and_position", ["quizId", "position"]);
