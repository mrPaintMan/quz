import type { ContentOf } from "@convex/questions/questionContent";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type DrawingContent = ContentOf<"drawing">;

export const drawingRules: QuestionTypeRules<DrawingContent> = {
  requiresTimeLimit: true,
  createEmptyContent: () => ({ type: "drawing", maxPoints: 1 }),
  maxPoints: (content) => content.maxPoints,
  findProblems: (content) => problemIfNotPositive(content.maxPoints, "Maxpoängen måste vara större än 0."),
};
