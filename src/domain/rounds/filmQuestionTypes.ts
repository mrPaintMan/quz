import type { QuestionType } from "@convex/questions/questionContent";
import { questionTypeRules } from "@/domain/questionTypes/registry";

// Any question that is answered in the app can follow a film; not a trip, nor an activity,
// which is done in the room rather than answered.
export function isFilmQuestionType(type: QuestionType): boolean {
  return type !== "paSparet" && type !== "activity";
}

export function filmQuestionTypes(): QuestionType[] {
  return (Object.keys(questionTypeRules) as QuestionType[]).filter(isFilmQuestionType);
}
