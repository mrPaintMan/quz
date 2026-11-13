import type { AnswerContent } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { answeringOf } from "@/domain/answering/registry";
import { isAnswerFor } from "./isAnswerFor";

// Whether a locked answer gives anything: it fits the question and is filled in as sending needs,
// so a draft that locked empty, such as a cleared drawing, counts as no answer (D62).
export function isGivenAnswer(content: QuestionContent, answer: AnswerContent): boolean {
  const answering = answeringOf(content);
  return isAnswerFor(content, answer) && answering !== null && answering.isComplete(answering.show(content), answer);
}
