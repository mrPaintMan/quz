import type { QuestionContent } from "@convex/questions/questionContent";

export type Problem = { message: string };

export type QuestionTypeRules<C extends QuestionContent> = {
  requiresTimeLimit: boolean;
  // null when the type has no fixed maximum, such as an open list.
  maxPoints: (content: C) => number | null;
  findProblems: (content: C) => Problem[];
};
