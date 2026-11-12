import type { Id } from "@convex/_generated/dataModel";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { optionLetter } from "./optionLetter";

export type MultipleChoiceShown = { type: "multipleChoice"; options: { text: string; imageId: Id<"_storage"> | null }[] };
export type MultipleChoiceRevealed = MultipleChoiceShown & { correctIndex: number | null };

// An option by its letter and text ("B · Norge"), or its letter alone for a picture.
const optionName = (options: { text: string }[], index: number) => {
  const text = options[index]?.text.trim() ?? "";
  return text === "" ? optionLetter(index) : `${optionLetter(index)} · ${text}`;
};

export const multipleChoiceAnswering: AnsweringRules<"multipleChoice", MultipleChoiceShown, MultipleChoiceRevealed> = {
  show: ({ options }) => ({ type: "multipleChoice", options }),
  reveal: ({ options, correctIndex }) => ({ type: "multipleChoice", options, correctIndex }),
  imageIds: ({ options }) => options.flatMap((option) => (option.imageId === null ? [] : [option.imageId])),
  // One of the options shown, so a stray number from a phone never counts as an answer.
  startingAnswer: () => null,
  isComplete: (shown, { optionIndex }) => optionIndex !== null && Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < shown.options.length,
  // The full points for the right option, nothing for any other.
  outcomes: ({ options, correctIndex, points }, answers) =>
    answers.map(({ optionIndex }) => {
      const isRight = optionIndex !== null && optionIndex === correctIndex;
      const given = optionIndex === null ? "" : optionName(options, optionIndex);
      const correct = correctIndex === null ? "" : optionName(options, correctIndex);
      const scored = isRight ? (points ?? 0) : 0;
      return { points: scored, parts: [{ label: "", given, result: isRight ? "right" : "wrong", correct, points: scored }] };
    }),
};
