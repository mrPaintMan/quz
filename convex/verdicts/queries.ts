import { v } from "convex/values";
import { reviewOf } from "@/domain/answering/registry";
import { givenNames, withVerdicts } from "@/domain/review/typedReview";
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
    const verdicts = await verdictsOfQuestion(ctx, gameId, questionId);
    return {
      slots: review.slots(question.content).map(({ title, options, isOpen }, slot) => ({
        title,
        options: options.map((option) => option.label),
        isOpen: isOpen === true,
        // The names already given to right items outside an open slot's key (D53).
        names: givenNames(verdicts)
          .filter((given) => given.slot === slot)
          .map((given) => given.name),
      })),
      items: withVerdicts(items, verdicts),
      aiStatus: (await aiJudgingOf(ctx, { gameId, questionId }))?.status ?? null,
    };
  },
});
