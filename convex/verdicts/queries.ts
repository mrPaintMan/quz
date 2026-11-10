import { v } from "convex/values";
import { reviewOf } from "@/domain/answering/registry";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { textsToReview } from "@/domain/review/typedReview";
import { lockedAnswersOfQuestion } from "../answers/lockedAnswersOfQuestion";
import { hostQuery } from "../auth/hostFunctions";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

// Host-only, as it shows what the teams wrote: the typed texts of a closed question that matched
// no accepted spelling, each once with how many teams wrote it and the hosts' verdict so far
// (D51). null for a question without typed answers, one still open, or one that is gone.
export const getReview = hostQuery({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    const game = await ctx.db.get("games", gameId);
    const question = await ctx.db.get("questions", questionId);
    if (game === null || question === null || !(game.closedQuestionIds ?? []).includes(questionId)) return null;
    const review = reviewOf(question.content);
    if (review === null) return null;
    const answers = (await lockedAnswersOfQuestion(ctx, gameId, questionId))
      .map((answer) => answer.content)
      .filter((answer) => isAnswerFor(question.content, answer));
    const verdicts = await verdictsOfQuestion(ctx, gameId, questionId);
    const targetOf = (slot: number, text: string) => verdicts.find((verdict) => verdict.slot === slot && verdict.text === text)?.target;
    return {
      slots: review.slots(question.content).map(({ title, options }) => ({ title, options: options.map((option) => option.label) })),
      items: textsToReview(review, question.content, answers).map((item) => {
        const target = targetOf(item.slot, item.text);
        return { ...item, isJudged: target !== undefined, target: target ?? null };
      }),
    };
  },
});
