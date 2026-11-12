import type { AnsweredType, AnswerOf } from "@convex/answers/answerContent";
import type { Outcome } from "@/domain/answering/outcome";
import type { ShownQuestion } from "@/domain/answering/registry";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// What every type's result view gets (D59): the question as it was shown, the team's own sent
// answer, what each part of it counted as with its points, and links to the question's pictures.
export type ResultViewProps<T extends AnsweredType> = {
  shown: Extract<ShownQuestion, { type: T }>;
  answer: AnswerOf<T>;
  outcome: Outcome;
  imageUrls: ImageUrls;
};
