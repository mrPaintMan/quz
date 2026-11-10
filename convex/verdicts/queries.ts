import { v } from "convex/values";
import { reviewOf } from "@/domain/answering/registry";
import { withVerdicts } from "@/domain/review/typedReview";
import { aiJudgingOf } from "../aiJudge/judging";
import { hostQuery } from "../auth/hostFunctions";
import { textsToReviewOfQuestion } from "./textsToReviewOfQuestion";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

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
    return {
      slots: review.slots(question.content).map(({ title, options }) => ({ title, options: options.map((option) => option.label) })),
      items: withVerdicts(items, await verdictsOfQuestion(ctx, gameId, questionId)),
      aiStatus: (await aiJudgingOf(ctx, { gameId, questionId }))?.status ?? null,
    };
  },
});
