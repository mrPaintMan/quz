import { v, type Infer } from "convex/values";

// One screen of the night (D15). Screens are named by what they show, not by their place in
// the sequence, so the TV stays put when the quiz is edited during the game.
export const screen = v.union(
  v.object({ kind: v.literal("lobby") }),
  v.object({ kind: v.literal("rules") }),
  v.object({ kind: v.literal("roundIntro"), roundId: v.id("rounds") }),
  v.object({ kind: v.literal("question"), questionId: v.id("questions") }),
  v.object({ kind: v.literal("answer"), questionId: v.id("questions") }),
  v.object({ kind: v.literal("film"), roundId: v.id("rounds"), filmId: v.string() }),
  v.object({ kind: v.literal("leaderboard"), roundId: v.id("rounds") }),
  v.object({ kind: v.literal("finalLeaderboard") }),
);

export type Screen = Infer<typeof screen>;
