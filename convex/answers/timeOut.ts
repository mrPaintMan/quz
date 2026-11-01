import { v } from "convex/values";
import { ANSWER_GRACE_MS } from "@/domain/answers/isTimeOut";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { lockDraftsOfQuestion } from "./lockDraftsOfQuestion";

// Locks a question's drafts once its time is out. Scheduled whenever its timer starts or changes;
// a run whose timer has since been paused, extended or left behind does nothing, as a later run
// covers the timer that replaced it.
export const lockDraftsAtTimeOut = internalMutation({
  args: { gameId: v.id("games"), questionId: v.id("questions"), endsAt: v.number() },
  handler: async (ctx, { gameId, questionId, endsAt }) => {
    const game = await ctx.db.get("games", gameId);
    const isSameQuestion = game?.screen.kind === "question" && game.screen.questionId === questionId;
    if (game?.endedAt !== null || !isSameQuestion || game.timer?.kind !== "running" || game.timer.endsAt !== endsAt) return;
    await lockDraftsOfQuestion(ctx, gameId, questionId);
  },
});

// Schedules the lock for the timer of the question showing now, if it runs.
export async function scheduleTimeOutLock(ctx: MutationCtx, game: Pick<Doc<"games">, "_id" | "screen" | "timer">) {
  if (game.screen.kind !== "question" || game.timer?.kind !== "running") return;
  const { endsAt } = game.timer;
  await ctx.scheduler.runAt(endsAt + ANSWER_GRACE_MS, internal.answers.timeOut.lockDraftsAtTimeOut, {
    gameId: game._id,
    questionId: game.screen.questionId,
    endsAt,
  });
}
