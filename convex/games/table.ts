import { defineTable } from "convex/server";
import { v } from "convex/values";
import { playback } from "./playback";
import { screen } from "./screen";
import { timer } from "./timer";

// At most one game runs at a time, so phones join it at quz.nu without a join word.
export const gamesTable = defineTable({
  quizId: v.id("quizzes"),
  // null while the game runs.
  endedAt: v.union(v.number(), v.null()),
  // The screen showing now, and its place in the sequence when it was shown: the place is
  // used only if the screen has gone from the quiz since (findScreenIndex).
  screen,
  screenIndex: v.number(),
  // The timer of the question showing now; left out on any other screen and for a question
  // without a time limit. Optional rather than nullable so games started before it still match.
  timer: v.optional(timer),
  // The clip of the question showing now, kept like the timer.
  playback: v.optional(playback),
})
  .index("by_endedAt", ["endedAt"])
  .index("by_quizId", ["quizId"]);
