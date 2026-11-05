import type { Id } from "@convex/_generated/dataModel";
import type { AnsweringRules } from "@/domain/answering/answeringRules";

export type MultipleChoiceShown = { type: "multipleChoice"; options: { text: string; imageId: Id<"_storage"> | null }[] };
export type MultipleChoiceRevealed = MultipleChoiceShown & { correctIndex: number | null };

export const multipleChoiceAnswering: AnsweringRules<"multipleChoice", MultipleChoiceShown, MultipleChoiceRevealed> = {
  show: ({ options }) => ({ type: "multipleChoice", options }),
  reveal: ({ options, correctIndex }) => ({ type: "multipleChoice", options, correctIndex }),
  imageIds: ({ options }) => options.flatMap((option) => (option.imageId === null ? [] : [option.imageId])),
  // One of the options shown, so a stray number from a phone never counts as an answer.
  startingAnswer: () => null,
  isComplete: (shown, { optionIndex }) => optionIndex !== null && Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < shown.options.length,
  // The full points for the right option, nothing for any other.
  grade: (content, answers) =>
    answers.map((answer) => (answer.optionIndex !== null && answer.optionIndex === content.correctIndex ? (content.points ?? 0) : 0)),
};
