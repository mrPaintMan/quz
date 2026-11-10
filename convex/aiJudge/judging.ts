import { v } from "convex/values";
import { reviewOf } from "@/domain/answering/registry";
import { judgeMessage, usesAiJudge } from "@/domain/review/aiJudge";
import { withVerdicts } from "@/domain/review/typedReview";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from "../_generated/server";
import { textsToReviewOfQuestion } from "../verdicts/textsToReviewOfQuestion";
import { verdictsOfQuestion } from "../verdicts/verdictsOfQuestion";

type GameQuestion = { gameId: Id<"games">; questionId: Id<"questions"> };
const gameQuestion = { gameId: v.id("games"), questionId: v.id("questions") };

// The AI judge's progress on a question in a game, or null if it was never asked.
export function aiJudgingOf(ctx: QueryCtx, { gameId, questionId }: GameQuestion) {
  return ctx.db
    .query("aiJudgings")
    .withIndex("by_gameId_and_questionId", (q) => q.eq("gameId", gameId).eq("questionId", questionId))
    .unique();
}

async function setStatus(ctx: MutationCtx, ids: GameQuestion, status: "judging" | "done" | "failed") {
  const judging = await aiJudgingOf(ctx, ids);
  if (judging) await ctx.db.patch("aiJudgings", judging._id, { status });
  else await ctx.db.insert("aiJudgings", { ...ids, status });
}

// When Nästa closes a question whose typed texts the AI judges, asks it right away, so its
// verdicts are in long before the leaderboard (D50).
export async function startAiJudging(ctx: MutationCtx, ids: GameQuestion) {
  const question = await ctx.db.get("questions", ids.questionId);
  if (question === null || !usesAiJudge(question.content)) return;
  await setStatus(ctx, ids, "judging");
  await ctx.scheduler.runAfter(0, internal.aiJudge.judge.judgeQuestion, ids);
}

// What to ask the AI judge about a question: the sent texts no spelling matched and no one has
// judged yet. null when there is nothing to ask.
export const prepareJudging = internalQuery({
  args: gameQuestion,
  handler: async (ctx, { gameId, questionId }) => {
    const question = await ctx.db.get("questions", questionId);
    const review = question && reviewOf(question.content);
    if (!question || !review) return null;
    const items = withVerdicts(await textsToReviewOfQuestion(ctx, gameId, question, review), await verdictsOfQuestion(ctx, gameId, questionId))
      .filter((item) => !item.isJudged)
      .map(({ slot, text, written, teamCount }) => ({ slot, text, written, teamCount }));
    if (items.length === 0) return null;
    const slots = review.slots(question.content);
    return { message: judgeMessage(question.prompt, slots, items), slots, items };
  },
});

// Saves the AI judge's verdicts, marked as its own, except on texts the hosts judged meanwhile.
export const saveAiVerdicts = internalMutation({
  args: {
    ...gameQuestion,
    verdicts: v.array(v.object({ slot: v.number(), text: v.string(), target: v.union(v.number(), v.null()) })),
  },
  handler: async (ctx, { gameId, questionId, verdicts }) => {
    for (const { slot, text, target } of verdicts) {
      const existing = await ctx.db
        .query("verdicts")
        .withIndex("by_gameId_and_questionId_and_slot_and_text", (q) =>
          q.eq("gameId", gameId).eq("questionId", questionId).eq("slot", slot).eq("text", text),
        )
        .unique();
      if (existing === null) await ctx.db.insert("verdicts", { gameId, questionId, slot, text, target, byAi: true });
    }
    await setStatus(ctx, { gameId, questionId }, "done");
  },
});

// The AI judge couldn't answer; its texts stay for the hosts.
export const failJudging = internalMutation({
  args: gameQuestion,
  handler: async (ctx, ids) => setStatus(ctx, ids, "failed"),
});
