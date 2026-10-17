import type { ContentOf } from "@convex/questions/questionContent";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

type ListContent = ContentOf<"list">;

// The answer key may be empty: open lists are graded through review (and the AI judge).
export const listRules: QuestionTypeRules<ListContent> = {
  requiresTimeLimit: true,
  maxPoints: () => null,
  findProblems: (content) => problemIf(content.pointsPerItem <= 0, "Poängen måste vara större än 0."),
};
