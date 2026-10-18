import { defineTable } from "convex/server";
import { v, type Infer } from "convex/values";
import { numberOrNull } from "./numberOrNull";
import { questionContent } from "./questionContent";

export const mediaKind = v.union(v.literal("image"), v.literal("audio"), v.literal("video"));
export type MediaKind = Infer<typeof mediaKind>;

const media = v.object({
  kind: mediaKind,
  storageId: v.id("_storage"),
});

// Deliberately permissive: autosave stores half-written questions, and
// completeness is checked by findQuestionProblems in src/domain.
export const questionsTable = defineTable({
  quizId: v.id("quizzes"),
  roundId: v.id("rounds"),
  position: v.number(),
  prompt: v.string(),
  timeLimitSeconds: numberOrNull,
  media: v.union(media, v.null()),
  hostNotes: v.string(),
  content: questionContent,
})
  .index("by_roundId_and_position", ["roundId", "position"])
  .index("by_quizId", ["quizId"]);
