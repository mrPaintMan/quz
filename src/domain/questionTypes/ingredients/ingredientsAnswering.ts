import type { AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { firstFilledIn } from "@/domain/questionTypes/firstFilledIn";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { gradeTyped, type TypedReview } from "@/domain/review/typedReview";

// While asked, only how many ingredients there are; on the answer screen, each ingredient by its
// first filled-in spelling.
export type IngredientsShown = { type: "ingredients"; count: number };
export type IngredientsRevealed = { type: "ingredients"; items: string[] };

// All fields are one slot, since the order doesn't matter; each ingredient is an option.
const ingredientsReview: TypedReview<ContentOf<"ingredients">, AnswerOf<"ingredients">> = {
  slots: ({ items }) => [{ title: "", options: items.map((item) => ({ label: firstFilledIn(item.spellings), spellings: item.spellings })) }],
  texts: ({ items }) => items.map((text) => ({ slot: 0, text })),
  pointsPerMatch: ({ pointsPerItem }) => pointsPerItem ?? 0,
};

export const ingredientsAnswering: AnsweringRules<"ingredients", IngredientsShown, IngredientsRevealed> = {
  show: ({ items }) => ({ type: "ingredients", count: items.length }),
  reveal: ({ items }) => ({ type: "ingredients", items: items.map((item) => firstFilledIn(item.spellings)) }),
  imageIds: () => [],
  startingAnswer: () => null,
  // One text per field; empty rows are fine as long as one is filled in.
  isComplete: (shown, { items }) => items.length === shown.count && items.some((item) => !isBlank(item)),
  // The points per ingredient for each ingredient guessed, in any field and order, counted once
  // however often it is written. A guess matches an accepted spelling compared as everywhere else
  // (normalizeForComparison), or by the hosts' verdict (D51). Empty texts never match anything.
  grade: (content, answers, verdicts = []) => gradeTyped(ingredientsReview, content, answers, verdicts),
  review: ingredientsReview,
};
