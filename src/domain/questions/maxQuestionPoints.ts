import type { QuestionContent } from "@convex/questions/questionContent";
import { rulesFor } from "../questionTypes/registry";

// null when the question has no fixed maximum, such as an open list.
export function maxQuestionPoints(content: QuestionContent): number | null {
  return rulesFor(content).maxPoints(content);
}
