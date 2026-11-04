import type { Id } from "@convex/_generated/dataModel";
import type { AnsweringRules } from "@/domain/answering/answeringRules";

export type MultipleChoiceShown = { type: "multipleChoice"; options: { text: string; imageId: Id<"_storage"> | null }[] };
export type MultipleChoiceRevealed = MultipleChoiceShown & { correctIndex: number | null };

export const multipleChoiceAnswering: AnsweringRules<"multipleChoice", MultipleChoiceShown, MultipleChoiceRevealed> = {
  show: ({ options }) => ({ type: "multipleChoice", options }),
  reveal: ({ options, correctIndex }) => ({ type: "multipleChoice", options, correctIndex }),
  imageIds: ({ options }) => options.flatMap((option) => (option.imageId === null ? [] : [option.imageId])),
  isComplete: (answer) => answer.optionIndex !== null,
  // The full points for the right option, nothing for any other.
  grade: (content, answer) => (answer.optionIndex !== null && answer.optionIndex === content.correctIndex ? (content.points ?? 0) : 0),
};
