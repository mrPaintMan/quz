import type { QuestionType } from "@convex/questions/questionContent";
import type { RoundKind } from "@convex/rounds/table";
import { questionTypeRules } from "@/domain/questionTypes/registry";
import { isTypeAllowedInRound } from "@/domain/rounds/isTypeAllowedInRound";

export function allowedQuestionTypes(roundKind: RoundKind): QuestionType[] {
  return (Object.keys(questionTypeRules) as QuestionType[]).filter((type) => isTypeAllowedInRound(roundKind, type));
}
