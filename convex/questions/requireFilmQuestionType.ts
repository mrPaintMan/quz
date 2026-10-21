import { ConvexError } from "convex/values";
import { isFilmQuestionType } from "@/domain/rounds/filmQuestionTypes";
import type { QuestionType } from "./questionContent";

export function requireFilmQuestionType(type: QuestionType): void {
  if (!isFilmQuestionType(type)) {
    throw new ConvexError("Den här frågetypen kan inte ställas efter en film.");
  }
}
