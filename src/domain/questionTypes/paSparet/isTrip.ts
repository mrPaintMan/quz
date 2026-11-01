import type { ContentOf, QuestionContent } from "@convex/questions/questionContent";

// The trip is På spåret's own question, the one whose film shows the clue points (D30).
export function isTrip(content: QuestionContent): content is ContentOf<"paSparet"> {
  return content.type === "paSparet";
}
