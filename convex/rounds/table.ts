import { defineTable } from "convex/server";
import { v, type Infer } from "convex/values";
import { videoMedia } from "../questions/table";

export const roundKind = v.union(v.literal("questions"), v.literal("paSparet"));
export type RoundKind = Infer<typeof roundKind>;

// A film in a På spåret round, after which its questions are answered (D32). The video is null
// until it has been uploaded.
export const film = v.object({ id: v.string(), video: v.union(videoMedia, v.null()) });
export type Film = Infer<typeof film>;

export const roundsTable = defineTable({
  quizId: v.id("quizzes"),
  position: v.number(),
  title: v.string(),
  kind: roundKind,
  // A På spåret round's films, in order; at most three questions in all are asked after them.
  // Left out for question rounds, and for På spåret rounds made before D32 (no films yet).
  films: v.optional(v.array(film)),
}).index("by_quizId_and_position", ["quizId", "position"]);
