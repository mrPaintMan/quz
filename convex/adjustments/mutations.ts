import { ConvexError, v } from "convex/values";
import { isActivityPoints, isCorrection, roundPoints } from "@/domain/scoring/manualPoints";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { hostMutation } from "../auth/hostFunctions";
import { requireRunningGame } from "../games/requireRunningGame";
import { getOrThrow } from "../shared/getOrThrow";
import { activityPointsOf } from "./activityPointsOf";

async function requireTeamOf(ctx: QueryCtx, game: Doc<"games">, teamId: Id<"teams">) {
  const team = await getOrThrow(ctx, "teams", teamId);
  if (team.gameId !== game._id) throw new ConvexError("Laget är inte med i quizet.");
  return team;
}

// The hosts set a team's points for an activity of the quiz, from 0 up to its most, or clear them
// with null; set again, they replace the earlier ones (D61). They count in the scores at once.
export const setActivityPoints = hostMutation({
  args: { gameId: v.id("games"), questionId: v.id("questions"), teamId: v.id("teams"), points: v.union(v.number(), v.null()) },
  handler: async (ctx, { gameId, questionId, teamId, points }) => {
    const game = await requireRunningGame(ctx, gameId);
    const question = await getOrThrow(ctx, "questions", questionId);
    if (question.quizId !== game.quizId || question.content.type !== "activity") throw new ConvexError("Frågan är ingen aktivitet i quizet.");
    await requireTeamOf(ctx, game, teamId);
    if (points !== null && !isActivityPoints(points, question.content.maxPoints)) {
      const { maxPoints } = question.content;
      throw new ConvexError(maxPoints === null ? "Poängen kan inte vara negativ." : `Poängen ska vara mellan 0 och ${maxPoints}.`);
    }
    const existing = (await activityPointsOf(ctx, gameId, questionId)).find((adjustment) => adjustment.teamId === teamId);
    if (points === null) {
      if (existing) await ctx.db.delete("adjustments", existing._id);
      return;
    }
    if (existing) await ctx.db.patch("adjustments", existing._id, { points: roundPoints(points) });
    else await ctx.db.insert("adjustments", { gameId, teamId, questionId, points: roundPoints(points) });
  },
});

// The hosts correct a mistake by adding or taking away a team's points, at any time (D61).
export const addCorrection = hostMutation({
  args: { gameId: v.id("games"), teamId: v.id("teams"), points: v.number() },
  handler: async (ctx, { gameId, teamId, points }) => {
    const game = await requireRunningGame(ctx, gameId);
    await requireTeamOf(ctx, game, teamId);
    if (!isCorrection(points)) throw new ConvexError("Skriv hur många poäng som ska läggas till eller dras av.");
    await ctx.db.insert("adjustments", { gameId, teamId, questionId: null, points: roundPoints(points) });
  },
});

// Takes a correction back.
export const removeCorrection = hostMutation({
  args: { gameId: v.id("games"), adjustmentId: v.id("adjustments") },
  handler: async (ctx, { gameId, adjustmentId }) => {
    await requireRunningGame(ctx, gameId);
    const adjustment = await ctx.db.get("adjustments", adjustmentId);
    if (adjustment === null || adjustment.gameId !== gameId || adjustment.questionId !== null) return;
    await ctx.db.delete("adjustments", adjustmentId);
  },
});
