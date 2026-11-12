import type { AnsweredType, AnswerOf } from "@convex/answers/answerContent";
import type { Outcome } from "@/domain/answering/outcome";
import type { RevealedAnswer, ShownQuestion } from "@/domain/answering/registry";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";

// What every type's result view gets (D59): the question as it was shown, the team's own sent
// answer, what each part of it counted as with its points, and links to the question's pictures;
// for a type that reveals what every team answered, that reveal (such as the teams' pins, D60) and
// the team's own id to tell its answer apart.
export type ResultViewProps<T extends AnsweredType> = {
  shown: Extract<ShownQuestion, { type: T }>;
  answer: AnswerOf<T>;
  outcome: Outcome;
  imageUrls: ImageUrls;
  revealed: Extract<RevealedAnswer, { type: T }> | null;
  teamId: string;
};
