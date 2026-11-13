import type { QuestionContent } from "@convex/questions/questionContent";
import { answeringOf } from "@/domain/answering/registry";

// Whether the hosts give a question's points by hand: an activity, or a type such as a drawing
// whose answers they score once shown (D61, D62).
export function isScoredByHand(content: QuestionContent): boolean {
  return content.type === "activity" || answeringOf(content)?.scoredByHand === true;
}
