import { v } from "convex/values";
import type { AnswerContent } from "../answers/answerContent";
import type { QuestionContent } from "../questions/questionContent";
import { reviewOf } from "@/domain/answering/registry";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { isQuestionLocked } from "@/domain/answers/isQuestionLocked";
import { answerBreakdowns, givenNames, type TypedReview, type Verdict } from "@/domain/review/typedReview";
import { lockedAnswersOfQuestion } from "../answers/lockedAnswersOfQuestion";
import { hostQuery } from "../auth/hostFunctions";
import { teamsOfGame } from "../teams/teamsOfGame";
import { judgingOfQuestion } from "./judgingOfQuestion";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

// A question's slots as the hosts judge them: each sub-question's title and answer, its accepted
// answers by label, whether it is open, and the names already given to right items outside an open
// slot's key (D53).
function slotsForHosts(review: TypedReview<QuestionContent, AnswerContent>, content: QuestionContent, verdicts: Verdict[]) {
  return review.slots(content).map(({ title, options, isOpen, answer }, slot) => ({
    title,
    answer: answer ?? null,
    options: options.map((option) => option.label),
    isOpen: isOpen === true,
    names: givenNames(verdicts)
      .filter((given) => given.slot === slot)
      .map((given) => given.name),
  }));
}

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
      slots: slotsForHosts(review, question.content, verdicts),
      items,
      exact,
      unjudged,
      aiStatus,
      phase,
    };
  },
});

// Host-only, for the window of every answer (D65): once a typed question's answers are locked, each
// team of the game with its texts in the order written, what each counts as now (judged or not, by
// the AI or not) and its result, and the team's points for the question; a team that sent nothing
// is there too. null for a question without typed answers, one still open, or one that is gone.
export const getAllAnswers = hostQuery({
  args: { gameId: v.id("games"), questionId: v.id("questions") },
  handler: async (ctx, { gameId, questionId }) => {
    const game = await ctx.db.get("games", gameId);
    const question = await ctx.db.get("questions", questionId);
    const review = question && reviewOf(question.content);
    if (game === null || !question || !review || !isQuestionLocked(game, questionId)) return null;
    const [teams, locked, verdicts] = await Promise.all([
      teamsOfGame(ctx, gameId),
      lockedAnswersOfQuestion(ctx, gameId, questionId),
      verdictsOfQuestion(ctx, gameId, questionId),
    ]);
    const fitting = locked.filter((answer) => isAnswerFor(question.content, answer.content));
    const breakdowns = answerBreakdowns(
      review,
      question.content,
      fitting.map((answer) => answer.content),
      verdicts,
    );
    return {
      slots: slotsForHosts(review, question.content, verdicts),
      teams: teams.map(({ _id, name, colour }) => {
        const index = fitting.findIndex((answer) => answer.teamId === _id);
        const breakdown = index === -1 ? null : breakdowns[index];
        return {
          teamId: _id,
          name,
          colour,
          hasAnswered: breakdown !== null,
          points: breakdown?.points ?? 0,
          texts: (breakdown?.texts ?? []).map(({ target, ...text }) => ({ ...text, isJudged: target !== undefined, target: target ?? null })),
        };
      }),
    };
  },
});
