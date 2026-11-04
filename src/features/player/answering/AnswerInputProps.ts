import type { AnsweredType, AnswerOf } from "@convex/answers/answerContent";
import type { ShownQuestion } from "@/domain/answering/registry";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// What every type's answer input gets: the question as shown, the team's answer so far (null
// before the first change), and whether it may still change.
export type AnswerInputProps<T extends AnsweredType> = {
  shown: Extract<ShownQuestion, { type: T }>;
  answer: AnswerOf<T> | null;
  imageUrls: ImageUrls;
  disabled: boolean;
  onChange: (answer: AnswerOf<T>) => void;
};
