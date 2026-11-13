import type { ComponentType } from "react";
import type { AnsweredType } from "@convex/answers/answerContent";
import { FreeTextResult } from "./freeText/FreeTextResult";
import { IngredientsResult } from "./ingredients/IngredientsResult";
import { ListResult } from "./list/ListResult";
import { MapPinResult } from "./mapPin/MapPinResult";
import { MatchResult } from "./match/MatchResult";
import { MultipleChoiceResult } from "./multipleChoice/MultipleChoiceResult";
import { NumberResult } from "./number/NumberResult";
import type { ResultViewProps } from "./ResultViewProps";
import { SortResult } from "./sort/SortResult";
import { DrawingResult } from "./drawing/DrawingResult";

// How each type shows the team's own answer on its phone once the answer is out: drawn like its
// input, the parts that scored lit up (D59). The fourth entry of a type's answering, beside its
// rules, its input and its TV display (D42); null until built, and the phone then shows the total.
export const resultViews: { [T in AnsweredType]: ComponentType<ResultViewProps<T>> | null } = {
  multipleChoice: MultipleChoiceResult,
  freeText: FreeTextResult,
  number: NumberResult,
  sort: SortResult,
  match: MatchResult,
  list: ListResult,
  ingredients: IngredientsResult,
  drawing: DrawingResult,
  mapPin: MapPinResult,
  paSparet: null,
};
