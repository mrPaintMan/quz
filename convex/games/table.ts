import { defineTable } from "convex/server";
import { v } from "convex/values";
import { screen } from "./screen";

// At most one game runs at a time, so phones join it at quz.nu without a join word.
export const gamesTable = defineTable({
  quizId: v.id("quizzes"),
  // null while the game runs.
  endedAt: v.union(v.number(), v.null()),
  // The screen showing now, and its place in the sequence when it was shown: the place is
  // used only if the screen has gone from the quiz since (findScreenIndex).
  screen,
  screenIndex: v.number(),
})
  .index("by_endedAt", ["endedAt"])
  .index("by_quizId", ["quizId"]);
