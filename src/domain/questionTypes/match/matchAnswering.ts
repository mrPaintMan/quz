import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { isDrawnFrom } from "@/domain/ordering/isDrawnFrom";
import { shuffleUnsolved } from "@/domain/ordering/shuffleUnsolved";

// While asked, the left-hand items in the question's order and the right-hand ones shuffled the
// same way on every phone and the TV; on the answer screen, the right pairs.
export type MatchShown = { type: "match"; left: string[]; right: string[] };
export type MatchRevealed = { type: "match"; pairs: { left: string; right: string }[] };

export const matchAnswering: AnsweringRules<"match", MatchShown, MatchRevealed> = {
  show: ({ pairs }) => ({ type: "match", left: pairs.map((pair) => pair.left), right: shuffleUnsolved(pairs.map((pair) => pair.right)) }),
  reveal: ({ pairs }) => ({ type: "match", pairs }),
  imageIds: () => [],
  startingAnswer: () => null,
  // At least one pair, each joining a right-hand item shown, none used more often than shown.
  isComplete: (shown, { rightByLeft }) => {
    const joined = rightByLeft.filter((right) => right !== null);
    return rightByLeft.length === shown.left.length && joined.length > 0 && isDrawnFrom(joined, shown.right);
  },
  // The points per pair for each right pair; an item left unpaired scores nothing. An answer that
  // uses a right-hand item more often than it is shown, which no phone can send, scores nothing,
  // so a repeated text can't be collected for every left-hand item.
  grade: ({ pairs, pointsPerPair }, answers) =>
    answers.map(({ rightByLeft }) => {
      const joined = rightByLeft.filter((right) => right !== null);
      if (!isDrawnFrom(joined, pairs.map((pair) => pair.right))) return 0;
      return pairs.filter((pair, index) => rightByLeft[index] === pair.right).length * (pointsPerPair ?? 0);
    }),
};
