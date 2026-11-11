import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { exactTexts, textsToReview, type TypedReview } from "@/domain/review/typedReview";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { AnswerContent } from "../answers/answerContent";
import { lockedAnswersOfQuestion } from "../answers/lockedAnswersOfQuestion";
import type { QuestionContent } from "../questions/questionContent";

// The texts the teams sent to a question in a game, from answers that still fit it: those no
// accepted spelling matched, to judge (D51), and those one matched exactly, to show (D56).
export async function sentTextsOfQuestion(
  ctx: QueryCtx,
  gameId: Id<"games">,
  question: Doc<"questions">,
  review: TypedReview<QuestionContent, AnswerContent>,
) {
  const answers = (await lockedAnswersOfQuestion(ctx, gameId, question._id))
    .map((answer) => answer.content)
    .filter((answer) => isAnswerFor(question.content, answer));
  return { toReview: textsToReview(review, question.content, answers), exact: exactTexts(review, question.content, answers) };
}
