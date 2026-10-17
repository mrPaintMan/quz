import type { ContentOf } from "@convex/questions/questionContent";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

type DrawingContent = ContentOf<"drawing">;

export const drawingRules: QuestionTypeRules<DrawingContent> = {
  requiresTimeLimit: true,
  maxPoints: (content) => content.maxPoints,
  findProblems: (content) => problemIf(content.maxPoints <= 0, "Maxpoängen måste vara större än 0."),
};
