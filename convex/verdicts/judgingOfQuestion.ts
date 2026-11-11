import { reviewOf } from "@/domain/answering/registry";
import { canStepOn, questionPhase } from "@/domain/judging/questionPhase";
import { usesAiJudge } from "@/domain/review/aiJudge";
import { withVerdicts } from "@/domain/review/typedReview";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { aiJudgingOf } from "../aiJudge/judging";
import { textsToReviewOfQuestion } from "./textsToReviewOfQuestion";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

// Where a question stands in a game's judging, in one place (D55): whether its answers are locked,
// its texts to review with their verdicts so far, and its phase. Locking a question whose texts the
// AI judges records the judging (lockQuestion), so a lock by time-out or by every team sending is
// known; any other question locks when Nästa closes it.
export async function judgingOfQuestion(ctx: QueryCtx, game: Doc<"games">, question: Doc<"questions">) {
  const aiJudging = await aiJudgingOf(ctx, { gameId: game._id, questionId: question._id });
  const isLocked = (game.closedQuestionIds ?? []).includes(question._id) || aiJudging !== null;
  const review = reviewOf(question.content);
  const verdicts = review && isLocked ? await verdictsOfQuestion(ctx, game._id, question._id) : [];
  const items = review && isLocked ? withVerdicts(await textsToReviewOfQuestion(ctx, game._id, question, review), verdicts) : [];
  const aiStatus = aiJudging?.status ?? null;
  const phase = questionPhase({
    isLocked,
    usesAiJudge: usesAiJudge(question.content),
    aiStatus,
    unjudged: items.filter((item) => !item.isJudged).length,
  });
  return { isLocked, review, verdicts, items, aiStatus, phase, canStepOn: canStepOn(phase) };
}
