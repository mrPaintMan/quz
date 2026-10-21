import { defineTable } from "convex/server";
import { v } from "convex/values";
import { answerContent } from "./answerContent";

// One answer per team and question: a draft saved as the team types, final once locked (D16).
export const answersTable = defineTable({
  gameId: v.id("games"),
  teamId: v.id("teams"),
  questionId: v.id("questions"),
  content: answerContent,
  // null while the answer is a draft.
  lockedAt: v.union(v.number(), v.null()),
})
  .index("by_teamId_and_questionId", ["teamId", "questionId"])
  .index("by_gameId_and_questionId", ["gameId", "questionId"]);
