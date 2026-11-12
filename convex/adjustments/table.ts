import { defineTable } from "convex/server";
import { v } from "convex/values";

// Points the hosts give by hand (D61): an activity's score, one per team, tied to its question; or
// a correction of a mistake, at any time, tied to no question.
export const adjustmentsTable = defineTable({
  gameId: v.id("games"),
  teamId: v.id("teams"),
  questionId: v.union(v.id("questions"), v.null()),
  points: v.number(),
}).index("by_gameId_and_questionId", ["gameId", "questionId"]);
