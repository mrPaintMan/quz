import type { ContentOf } from "@convex/questions/questionContent";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type ListContent = ContentOf<"list">;

// The answer key may be empty: open lists are graded through review (and the AI judge).
export const listRules: QuestionTypeRules<ListContent> = {
  requiresTimeLimit: true,
  requiresVideo: false,
  hasAnswerScreen: true,
  createEmptyContent: () => ({
    type: "list",
    acceptedItems: [],
    pointsPerItem: 1,
    fuzzy: true,
    aiAssist: false,
  }),
  maxPoints: () => null,
  findProblems: (content) => problemIfNotPositive(content.pointsPerItem),
};
