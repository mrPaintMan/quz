import type { ContentOf } from "@convex/questions/questionContent";
import { isBlank } from "../isBlank";
import { problemIf } from "../problemIf";
import type { QuestionTypeRules } from "../questionTypeRules";

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
    ...problemIf(content.points <= 0, "Poängen måste vara större än 0."),
  ],
};
