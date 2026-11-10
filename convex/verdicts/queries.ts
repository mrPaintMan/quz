import { v } from "convex/values";
import { reviewOf } from "@/domain/answering/registry";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import { withVerdicts, type Verdict } from "@/domain/review/typedReview";
import { aiJudgingOf } from "../aiJudge/judging";
import { hostQuery } from "../auth/hostFunctions";
import { textsToReviewOfQuestion } from "./textsToReviewOfQuestion";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

// Each name a verdict gave a right item in the slot, once as first given, alphabetically.
function namesInSlot(verdicts: Verdict[], slot: number) {
  const names = new Map<string, string>();
  for (const verdict of verdicts) {
    if (verdict.slot !== slot || typeof verdict.target !== "string") continue;
    const key = normalizeForComparison(verdict.target);
    if (!names.has(key)) names.set(key, verdict.target.trim());
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, "sv"));
}

// Host-only, as it shows what the teams wrote: the typed texts of a closed question that matched
// no accepted spelling, each once with how many teams wrote it and the verdict so far (D51), and
// how the AI judge is getting on (D52). null for a question without typed answers, one still
// open, or one that is gone.
export const getReview = hostQuery({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    const game = await ctx.db.get("games", gameId);
    const question = await ctx.db.get("questions", questionId);
    if (game === null || question === null || !(game.closedQuestionIds ?? []).includes(questionId)) return null;
    const review = reviewOf(question.content);
    if (review === null) return null;
    const items = await textsToReviewOfQuestion(ctx, gameId, question, review);
    const verdicts = await verdictsOfQuestion(ctx, gameId, questionId);
    return {
      slots: review.slots(question.content).map(({ title, options, isOpen }, slot) => ({
        title,
        options: options.map((option) => option.label),
        isOpen: isOpen === true,
        // The names already given to right items outside an open slot's key (D53).
        names: namesInSlot(verdicts, slot),
      })),
      items: withVerdicts(items, verdicts),
      aiStatus: (await aiJudgingOf(ctx, { gameId, questionId }))?.status ?? null,
    };
  },
});
