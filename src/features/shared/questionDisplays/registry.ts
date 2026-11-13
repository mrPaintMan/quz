import type { ComponentType } from "react";
import type { AnsweredType } from "@convex/answers/answerContent";
import { FreeTextAnswer, FreeTextQuestion } from "./freeText/FreeTextDisplay";
import { IngredientsAnswer, IngredientsQuestion } from "./ingredients/IngredientsDisplay";
import { ListAnswer, ListQuestion } from "./list/ListDisplay";
import { MapPinAnswer, MapPinQuestion } from "./mapPin/MapPinDisplay";
import { MatchAnswer, MatchQuestion } from "./match/MatchDisplay";
import { MultipleChoiceAnswer, MultipleChoiceQuestion } from "./multipleChoice/MultipleChoiceDisplay";
import { NumberAnswer, NumberQuestion } from "./number/NumberDisplay";
import { SortAnswer, SortQuestion } from "./sort/SortDisplay";
import type { RevealedDisplayProps, ShownDisplayProps } from "./QuestionDisplayProps";
import { DrawingAnswer, DrawingQuestion } from "./drawing/DrawingDisplay";
import { PaSparetAnswer, PaSparetQuestion } from "./paSparet/PaSparetDisplay";

type DisplayRegistration<T extends AnsweredType> = {
  Question: ComponentType<ShownDisplayProps<T>>;
  Answer: ComponentType<RevealedDisplayProps<T>>;
};

// How each type shows on the TV, during its question and on its answer screen (D14). null until
// its answering is built in M3, as in the domain's answering registry.
export const questionDisplays: { [T in AnsweredType]: DisplayRegistration<T> | null } = {
  multipleChoice: { Question: MultipleChoiceQuestion, Answer: MultipleChoiceAnswer },
  freeText: { Question: FreeTextQuestion, Answer: FreeTextAnswer },
  number: { Question: NumberQuestion, Answer: NumberAnswer },
  sort: { Question: SortQuestion, Answer: SortAnswer },
  match: { Question: MatchQuestion, Answer: MatchAnswer },
  list: { Question: ListQuestion, Answer: ListAnswer },
  ingredients: { Question: IngredientsQuestion, Answer: IngredientsAnswer },
  drawing: { Question: DrawingQuestion, Answer: DrawingAnswer },
  mapPin: { Question: MapPinQuestion, Answer: MapPinAnswer },
  paSparet: { Question: PaSparetQuestion, Answer: PaSparetAnswer },
};
