import type { ContentOf, QuestionContent, QuestionType } from "@convex/questions/questionContent";
import { activityRules } from "./activity/activityRules";
import { drawingRules } from "./drawing/drawingRules";
import { freeTextRules } from "./freeText/freeTextRules";
import { ingredientsRules } from "./ingredients/ingredientsRules";
import { listRules } from "./list/listRules";
import { mapPinRules } from "./mapPin/mapPinRules";
import { matchRules } from "./match/matchRules";
import { multipleChoiceRules } from "./multipleChoice/multipleChoiceRules";
import { numberRules } from "./number/numberRules";
import { paSparetRules } from "./paSparet/paSparetRules";
import type { QuestionTypeRules } from "./questionTypeRules";
import { sortRules } from "./sort/sortRules";

type RulesRegistry = { [T in QuestionType]: QuestionTypeRules<ContentOf<T>> };

// Typed as a complete map: a new question type does not compile until it has rules here.
export const questionTypeRules: RulesRegistry = {
  multipleChoice: multipleChoiceRules,
  freeText: freeTextRules,
  number: numberRules,
  sort: sortRules,
  match: matchRules,
  list: listRules,
  ingredients: ingredientsRules,
  drawing: drawingRules,
  mapPin: mapPinRules,
  paSparet: paSparetRules,
  activity: activityRules,
};

export function rulesFor<C extends QuestionContent>(content: C): QuestionTypeRules<C> {
  // TypeScript cannot link content.type to its registry entry on its own;
  // RulesRegistry above guarantees that each entry matches its type.
  return questionTypeRules[content.type] as unknown as QuestionTypeRules<C>;
}
