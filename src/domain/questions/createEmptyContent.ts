import type { ContentOf, QuestionType } from "@convex/questions/questionContent";
import { questionTypeRules } from "@/domain/questionTypes/registry";

export function createEmptyContent<T extends QuestionType>(type: T): ContentOf<T> {
  // The registry's type pairs each entry with its own content type.
  return questionTypeRules[type].createEmptyContent() as ContentOf<T>;
}
