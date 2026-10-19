import type { QuestionContent } from "@convex/questions/questionContent";

export type Problem = { message: string };

export type QuestionTypeRules<C extends QuestionContent> = {
  requiresTimeLimit: boolean;
  // Whether the question needs a video in its media, such as the På spåret film (D30).
  requiresVideo: boolean;
  // The draft a new question of this type starts from.
  createEmptyContent: () => C;
  // null when the type has no fixed maximum (an open list) or its points aren't filled in yet.
  maxPoints: (content: C) => number | null;
  findProblems: (content: C) => Problem[];
};
