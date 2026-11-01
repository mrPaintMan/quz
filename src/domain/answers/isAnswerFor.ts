import type { AnswerContent } from "@convex/answers/answerContent";
import type { QuestionContent } from "@convex/questions/questionContent";

// An answer fits a question of its own type; activities have no answer type (D34).
export function isAnswerFor(content: QuestionContent, answer: AnswerContent): boolean {
  return answer.type === content.type;
}
