import { v, type Infer } from "convex/values";
import { drawingAnswer } from "../questions/types/drawing/drawingAnswer";
import { freeTextAnswer } from "../questions/types/freeText/freeTextAnswer";
import { ingredientsAnswer } from "../questions/types/ingredients/ingredientsAnswer";
import { listAnswer } from "../questions/types/list/listAnswer";
import { mapPinAnswer } from "../questions/types/mapPin/mapPinAnswer";
import { matchAnswer } from "../questions/types/match/matchAnswer";
import { multipleChoiceAnswer } from "../questions/types/multipleChoice/multipleChoiceAnswer";
import { numberAnswer } from "../questions/types/number/numberAnswer";
import { paSparetAnswer } from "../questions/types/paSparet/paSparetAnswer";
import { sortAnswer } from "../questions/types/sort/sortAnswer";

// One entry per question type answered in the app; activities are scored by the hosts instead,
// through adjustments.
export const answerContent = v.union(
  multipleChoiceAnswer,
  freeTextAnswer,
  numberAnswer,
  sortAnswer,
  matchAnswer,
  listAnswer,
  ingredientsAnswer,
  drawingAnswer,
  mapPinAnswer,
  paSparetAnswer,
);

export type AnswerContent = Infer<typeof answerContent>;
