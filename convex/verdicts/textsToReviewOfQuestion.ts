import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { textsToReview, type TypedReview } from "@/domain/review/typedReview";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { AnswerContent } from "../answers/answerContent";
import { lockedAnswersOfQuestion } from "../answers/lockedAnswersOfQuestion";
import type { QuestionContent } from "../questions/questionContent";

// The texts the teams sent to a question in a game that no accepted spelling matched (D51), from
// answers that still fit the question.
export async function textsToReviewOfQuestion(
  ctx: QueryCtx,
  gameId: Id<"games">,
  question: Doc<"questions">,
  review: TypedReview<QuestionContent, AnswerContent>,
) {
  const answers = (await lockedAnswersOfQuestion(ctx, gameId, question._id))
    .map((answer) => answer.content)
    .filter((answer) => isAnswerFor(question.content, answer));
  return textsToReview(review, question.content, answers);
}
