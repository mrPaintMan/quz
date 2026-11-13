import type { ComponentType } from "react";
import type { AnsweredType } from "@convex/answers/answerContent";
import type { AnswerInputProps } from "./AnswerInputProps";
import { FreeTextInput } from "./freeText/FreeTextInput";
import { IngredientsInput } from "./ingredients/IngredientsInput";
import { ListInput } from "./list/ListInput";
import { MapPinInput } from "./mapPin/MapPinInput";
import { MatchInput } from "./match/MatchInput";
import { MultipleChoiceInput } from "./multipleChoice/MultipleChoiceInput";
import { NumberInput } from "./number/NumberInput";
import { SortInput } from "./sort/SortInput";
import { DrawingInput } from "./drawing/DrawingInput";
import { PaSparetInput } from "./paSparet/PaSparetInput";

// The answer input for each type answered in the app (D14). null until its answering is built in
// M3, as in the domain's answering registry; the phone then keeps pointing at the TV.
export const answerInputs: { [T in AnsweredType]: ComponentType<AnswerInputProps<T>> | null } = {
  multipleChoice: MultipleChoiceInput,
  freeText: FreeTextInput,
  number: NumberInput,
  sort: SortInput,
  match: MatchInput,
  list: ListInput,
  ingredients: IngredientsInput,
  drawing: DrawingInput,
  mapPin: MapPinInput,
  paSparet: PaSparetInput,
};
