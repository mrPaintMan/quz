import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { teamsOfGame } from "../teams/teamsOfGame";

// A night has some 50 questions and up to 12 teams, about 600 answers; this leaves room to spare.
export const MAX_ANSWERS_PER_GAME = 4000;
// Far more than any night's bonuses and activity scores; also the bound scores read (scoresOfGame).
export const MAX_ADJUSTMENTS_PER_GAME = 1000;
// Some 50 questions with a few dozen judged texts each, with room to spare.
export const MAX_VERDICTS_PER_GAME = 4000;

// Deletes a game with everything the teams did in it.
export async function deleteGame(ctx: MutationCtx, gameId: Id<"games">) {
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_gameId_and_questionId_and_lockedAt", (q) => q.eq("gameId", gameId))
    .take(MAX_ANSWERS_PER_GAME);
  const adjustments = await ctx.db
    .query("adjustments")
    .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
    .take(MAX_ADJUSTMENTS_PER_GAME);
  const verdicts = await ctx.db
    .query("verdicts")
    .withIndex("by_gameId_and_questionId_and_slot_and_text", (q) => q.eq("gameId", gameId))
    .take(MAX_VERDICTS_PER_GAME);
  // Deleting only part of a game would leave answers pointing at a game that is gone.
  if (
    answers.length === MAX_ANSWERS_PER_GAME ||
    adjustments.length === MAX_ADJUSTMENTS_PER_GAME ||
    verdicts.length === MAX_VERDICTS_PER_GAME
  ) {
    throw new ConvexError("Spelet har för många svar för att tas bort på en gång.");
  }
  const teams = await teamsOfGame(ctx, gameId);
  await Promise.all([
    ...answers.map((answer) => ctx.db.delete("answers", answer._id)),
    ...adjustments.map((adjustment) => ctx.db.delete("adjustments", adjustment._id)),
    ...verdicts.map((verdict) => ctx.db.delete("verdicts", verdict._id)),
    ...teams.map((team) => ctx.db.delete("teams", team._id)),
  ]);
  await ctx.db.delete("games", gameId);
}
