import { defineTable } from "convex/server";
import { v, type Infer } from "convex/values";
import { numberOrNull } from "./numberOrNull";
import { questionContent } from "./questionContent";

const imageOrAudio = v.object({
  kind: v.union(v.literal("image"), v.literal("audio")),
  storageId: v.id("_storage"),
});

// The film itself is in Cloudflare R2 (D32); its still stays in Convex storage. The still and
// the length are read in the host's browser while uploading (D30), so the editor can show the
// film without downloading it. Either is null if the browser couldn't.
export const videoMedia = v.object({
  kind: v.literal("video"),
  r2Key: v.string(),
  posterId: v.union(v.id("_storage"), v.null()),
  durationSeconds: numberOrNull,
});

export const questionMedia = v.union(imageOrAudio, videoMedia);
export type QuestionMedia = Infer<typeof questionMedia>;
export type MediaKind = QuestionMedia["kind"];
export type VideoMedia = Infer<typeof videoMedia>;

// Deliberately permissive: autosave stores half-written questions, and
// completeness is checked by findQuestionProblems in src/domain.
export const questionsTable = defineTable({
  quizId: v.id("quizzes"),
  roundId: v.id("rounds"),
  position: v.number(),
  prompt: v.string(),
  timeLimitSeconds: numberOrNull,
  media: v.union(questionMedia, v.null()),
  hostNotes: v.string(),
  content: questionContent,
  // Set for a question asked after one of a På spåret round's films (D33): the film's id on the
  // round. Left out for every other question.
  filmId: v.optional(v.string()),
})
  .index("by_roundId_and_position", ["roundId", "position"])
  .index("by_quizId", ["quizId"]);
