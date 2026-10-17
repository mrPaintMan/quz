import { defineTable } from "convex/server";
import { v } from "convex/values";
import { questionContent } from "./questionContent";

const media = v.object({
  kind: v.union(v.literal("image"), v.literal("audio"), v.literal("video")),
  storageId: v.id("_storage"),
});

// Deliberately permissive: autosave stores half-written questions, and
// completeness is checked by findQuestionProblems in src/domain.
export const questionsTable = defineTable({
  quizId: v.id("quizzes"),
  roundId: v.id("rounds"),
  position: v.number(),
  prompt: v.string(),
  timeLimitSeconds: v.union(v.number(), v.null()),
  media: v.union(media, v.null()),
  hostNotes: v.string(),
  content: questionContent,
})
  .index("by_roundId_and_position", ["roundId", "position"])
  .index("by_quizId", ["quizId"]);
