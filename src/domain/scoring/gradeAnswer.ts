import type { AnswerContent } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { answeringOf } from "@/domain/answering/registry";

// An answer's points as graded automatically. An answer that no longer fits its question (its
// type was changed during the game) or a type whose grading isn't built yet scores nothing.
export function gradeAnswer(content: QuestionContent, answer: AnswerContent): number {
  if (!isAnswerFor(content, answer)) return 0;
  return answeringOf(content)?.grade(content, answer) ?? 0;
}
