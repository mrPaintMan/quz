import type { ComponentType } from "react";
import type { AnsweredType } from "@convex/answers/answerContent";
import { MultipleChoiceAnswer, MultipleChoiceQuestion } from "./multipleChoice/MultipleChoiceDisplay";
import type { RevealedDisplayProps, ShownDisplayProps } from "./QuestionDisplayProps";

type DisplayRegistration<T extends AnsweredType> = {
  Question: ComponentType<ShownDisplayProps<T>>;
  Answer: ComponentType<RevealedDisplayProps<T>>;
};

// How each type shows on the TV, during its question and on its answer screen (D14). null until
// its answering is built in M3, as in the domain's answering registry.
export const questionDisplays: { [T in AnsweredType]: DisplayRegistration<T> | null } = {
  multipleChoice: { Question: MultipleChoiceQuestion, Answer: MultipleChoiceAnswer },
  freeText: null,
  number: null,
  sort: null,
  match: null,
  list: null,
  ingredients: null,
  drawing: null,
  mapPin: null,
  paSparet: null,
};
