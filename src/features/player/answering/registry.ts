import type { ComponentType } from "react";
import type { AnsweredType } from "@convex/answers/answerContent";
import type { AnswerInputProps } from "./AnswerInputProps";
import { MultipleChoiceInput } from "./multipleChoice/MultipleChoiceInput";
import { NumberInput } from "./number/NumberInput";

// The answer input for each type answered in the app (D14). null until its answering is built in
// M3, as in the domain's answering registry; the phone then keeps pointing at the TV.
export const answerInputs: { [T in AnsweredType]: ComponentType<AnswerInputProps<T>> | null } = {
  multipleChoice: MultipleChoiceInput,
  freeText: null,
  number: NumberInput,
  sort: null,
  match: null,
  list: null,
  ingredients: null,
  drawing: null,
  mapPin: null,
  paSparet: null,
};
