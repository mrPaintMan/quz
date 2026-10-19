import type { ContentOf } from "@convex/questions/questionContent";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type ActivityContent = ContentOf<"activity">;

export const activityRules: QuestionTypeRules<ActivityContent> = {
  requiresTimeLimit: false,
  requiresVideo: false,
  createEmptyContent: () => ({ type: "activity", maxPoints: 1 }),
  maxPoints: (content) => content.maxPoints,
  findProblems: (content) => problemIfNotPositive(content.maxPoints, "Maxpoängen måste vara större än 0."),
};
