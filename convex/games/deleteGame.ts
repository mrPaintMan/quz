import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { teamsOfGame } from "../teams/teamsOfGame";

// A night has some 50 questions and up to 12 teams, about 600 answers; this leaves room to spare.
const MAX_ANSWERS_PER_GAME = 4000;
const MAX_ADJUSTMENTS_PER_GAME = 1000;

// Deletes a game with everything the teams did in it.
export async function deleteGame(ctx: MutationCtx, gameId: Id<"games">) {
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", gameId))
    .take(MAX_ANSWERS_PER_GAME);
  const adjustments = await ctx.db
    .query("adjustments")
    .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
    .take(MAX_ADJUSTMENTS_PER_GAME);
  const teams = await teamsOfGame(ctx, gameId);
  await Promise.all([
    ...answers.map((answer) => ctx.db.delete("answers", answer._id)),
    ...adjustments.map((adjustment) => ctx.db.delete("adjustments", adjustment._id)),
    ...teams.map((team) => ctx.db.delete("teams", team._id)),
  ]);
  await ctx.db.delete("games", gameId);
}
