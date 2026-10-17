import type { ContentOf, QuestionType } from "@convex/questions/questionContent";

export type QuestionEditorProps<T extends QuestionType> = {
  content: ContentOf<T>;
  onChange: (content: ContentOf<T>) => void;
};
