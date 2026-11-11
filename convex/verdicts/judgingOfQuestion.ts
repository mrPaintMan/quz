import { reviewOf } from "@/domain/answering/registry";
import { isQuestionLocked } from "@/domain/answers/isQuestionLocked";
import { canStepOn, questionPhase } from "@/domain/judging/questionPhase";
import { usesAiJudge } from "@/domain/review/aiJudge";
import { withVerdicts } from "@/domain/review/typedReview";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { aiJudgingOf } from "../aiJudge/judging";
import { textsToReviewOfQuestion } from "./textsToReviewOfQuestion";
import { verdictsOfQuestion } from "./verdictsOfQuestion";

// Where a question stands in a game's judging, in one place (D55): whether its answers are locked,
// its texts to review with their verdicts so far, how many are left, and its phase.
export async function judgingOfQuestion(ctx: QueryCtx, game: Doc<"games">, question: Doc<"questions">) {
  const aiJudging = await aiJudgingOf(ctx, { gameId: game._id, questionId: question._id });
  const isLocked = isQuestionLocked(game, question._id);
  const review = reviewOf(question.content);
  const verdicts = review && isLocked ? await verdictsOfQuestion(ctx, game._id, question._id) : [];
  const items = review && isLocked ? withVerdicts(await textsToReviewOfQuestion(ctx, game._id, question, review), verdicts) : [];
  const aiStatus = aiJudging?.status ?? null;
  const unjudged = items.filter((item) => !item.isJudged).length;
  const phase = questionPhase({ isLocked, usesAiJudge: usesAiJudge(question.content), aiStatus, unjudged });
  return { isLocked, review, verdicts, items, unjudged, aiStatus, phase, canStepOn: canStepOn(phase) };
}
