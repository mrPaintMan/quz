import { v } from "convex/values";
import { givenNames } from "@/domain/review/typedReview";
import { hostQuery } from "../auth/hostFunctions";
import { judgingOfQuestion } from "./judgingOfQuestion";

// Host-only, as it shows what the teams wrote: the typed texts of a locked question, each once with
// how many teams wrote it: those no accepted spelling matched with the verdict so far (D51), and
// those one matched exactly (D56). Also how the AI judge is getting on (D52) and the question's
// judging phase, which Nästa waits on (D55). null for a question without typed answers, one still
// open, or one that is gone.
export const getReview = hostQuery({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    const game = await ctx.db.get("games", gameId);
    const question = await ctx.db.get("questions", questionId);
    if (game === null || question === null) return null;
    const { isLocked, review, verdicts, items, exact, unjudged, aiStatus, phase } = await judgingOfQuestion(ctx, game, question);
    if (!isLocked || review === null) return null;
    return {
      slots: review.slots(question.content).map(({ title, options, isOpen, answer }, slot) => ({
        title,
        answer: answer ?? null,
        options: options.map((option) => option.label),
        isOpen: isOpen === true,
        // The names already given to right items outside an open slot's key (D53).
        names: givenNames(verdicts)
          .filter((given) => given.slot === slot)
          .map((given) => given.name),
      })),
      items,
      exact,
      unjudged,
      aiStatus,
      phase,
    };
  },
});
