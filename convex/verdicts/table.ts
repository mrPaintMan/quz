import { defineTable } from "convex/server";
import { v } from "convex/values";

// The hosts' decisions on typed texts no accepted spelling matched, per game, question, slot and
// text, shared by every team that wrote that text there (D51). They belong to the night only.
export const verdictsTable = defineTable({
  gameId: v.id("games"),
  questionId: v.id("questions"),
  // The free-text field, or 0 for an ingredients question, whose fields are judged together.
  slot: v.number(),
  // Normalized as everywhere else (normalizeForComparison).
  text: v.string(),
  // The accepted answer, by its place in the slot, that the text counts as; null for wrong.
  target: v.union(v.number(), v.null()),
  // Set when the AI judge gave the verdict (D50); a host's verdict replaces it.
  byAi: v.optional(v.boolean()),
}).index("by_gameId_and_questionId_and_slot_and_text", ["gameId", "questionId", "slot", "text"]);
