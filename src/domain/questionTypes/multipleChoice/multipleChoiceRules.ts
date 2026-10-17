import type { ContentOf } from "@convex/questions/questionContent";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { problemIf } from "@/domain/questionTypes/problemIf";
import { problemIfNotPositive } from "@/domain/questionTypes/problemIfNotPositive";
import type { QuestionTypeRules } from "@/domain/questionTypes/questionTypeRules";

type MultipleChoiceContent = ContentOf<"multipleChoice">;

const MIN_OPTIONS = 2;

function findOptionProblems(content: MultipleChoiceContent) {
  return content.options.flatMap((option, index) =>
    problemIf(
      isBlank(option.text) && option.imageId === null,
      `Alternativ ${index + 1} saknar text eller bild.`,
    ),
  );
}

function hasValidCorrectIndex(content: MultipleChoiceContent) {
  return (
    Number.isInteger(content.correctIndex) &&
    content.correctIndex >= 0 &&
    content.correctIndex < content.options.length
  );
}

export const multipleChoiceRules: QuestionTypeRules<MultipleChoiceContent> = {
  requiresTimeLimit: false,
  maxPoints: (content) => content.points,
  findProblems: (content) => [
    ...problemIf(content.options.length < MIN_OPTIONS, `Lägg till minst ${MIN_OPTIONS} alternativ.`),
    ...findOptionProblems(content),
    ...problemIf(!hasValidCorrectIndex(content), "Välj vilket alternativ som är rätt."),
    ...problemIfNotPositive(content.points),
  ],
};
