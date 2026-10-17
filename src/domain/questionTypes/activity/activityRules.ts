import type { ContentOf } from "@convex/questions/questionContent";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

type ActivityContent = ContentOf<"activity">;

export const activityRules: QuestionTypeRules<ActivityContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.maxPoints,
  findProblems: (content) => problemIf(content.maxPoints <= 0, "Maxpoängen måste vara större än 0."),
};
