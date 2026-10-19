import type { ContentOf } from "@convex/questions/questionContent";
import { hasDuplicates } from "@/domain/questionTypes/hasDuplicates";
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

function hasValidCorrectIndex({ correctIndex, options }: MultipleChoiceContent) {
  return correctIndex !== null && Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length;
}

export const multipleChoiceRules: QuestionTypeRules<MultipleChoiceContent> = {
  requiresTimeLimit: false,
  requiresVideo: false,
  createEmptyContent: () => ({
    type: "multipleChoice",
    options: Array.from({ length: 4 }, () => ({ text: "", imageId: null })),
    correctIndex: null,
    points: 1,
  }),
  maxPoints: (content) => content.points,
  findProblems: (content) => [
    ...problemIf(content.options.length < MIN_OPTIONS, `Lägg till minst ${MIN_OPTIONS} alternativ.`),
    ...findOptionProblems(content),
    ...problemIf(hasDuplicates(content.options.map((option) => option.text)), "Två alternativ har samma text."),
    ...problemIf(!hasValidCorrectIndex(content), "Välj vilket alternativ som är rätt."),
    ...problemIfNotPositive(content.points),
  ],
};
