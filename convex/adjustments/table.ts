import { defineTable } from "convex/server";
import { v } from "convex/values";

// Points the hosts give by hand: an activity's score (tied to its question) or a bonus.
export const adjustmentsTable = defineTable({
  gameId: v.id("games"),
  teamId: v.id("teams"),
  questionId: v.union(v.id("questions"), v.null()),
  points: v.number(),
  note: v.string(),
}).index("by_gameId", ["gameId"]);
