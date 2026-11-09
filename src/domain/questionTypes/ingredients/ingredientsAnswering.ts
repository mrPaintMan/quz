import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";

// While asked, only how many ingredients there are; on the answer screen, each ingredient by its
// first spelling.
export type IngredientsShown = { type: "ingredients"; count: number };
export type IngredientsRevealed = { type: "ingredients"; items: string[] };

export const ingredientsAnswering: AnsweringRules<"ingredients", IngredientsShown, IngredientsRevealed> = {
  show: ({ items }) => ({ type: "ingredients", count: items.length }),
  reveal: ({ items }) => ({ type: "ingredients", items: items.map((item) => item.spellings[0] ?? "") }),
  imageIds: () => [],
  startingAnswer: () => null,
  // One text per field; empty rows are fine as long as one is filled in.
  isComplete: (shown, { items }) => items.length === shown.count && items.some((item) => !isBlank(item)),
  // The points per ingredient for each ingredient guessed, in any field and order, counted once
  // however often it is written. A guess matches an accepted spelling compared as everywhere
  // else (normalizeForComparison); near misses are left to the AI judge (D50).
  // Empty texts (a blank field, a spelling of only a full stop) never match anything.
  grade: ({ items, pointsPerItem }, answers) => {
    const spellingsOf = items.map((item) => item.spellings.map(normalizeForComparison).filter((spelling) => spelling !== ""));
    return answers.map((answer) => {
      const guesses = new Set(answer.items.map(normalizeForComparison).filter((guess) => guess !== ""));
      const guessed = spellingsOf.filter((spellings) => spellings.some((spelling) => guesses.has(spelling)));
      return guessed.length * (pointsPerItem ?? 0);
    });
  },
};
