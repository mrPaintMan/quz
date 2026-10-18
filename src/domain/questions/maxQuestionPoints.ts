import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "@/domain/questionTypes/registry";

// null when the question has no fixed maximum (an open list) or its points aren't filled in yet.
export function maxQuestionPoints(content: QuestionContent): number | null {
  return rulesFor(content).maxPoints(content);
}
