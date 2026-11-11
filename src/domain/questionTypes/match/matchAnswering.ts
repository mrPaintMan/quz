import type { AnsweringRules } from "@/domain/answering/answeringRules";
import type { OutcomePart } from "@/domain/answering/outcome";
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
  // Each left-hand item with the team's pair for it; the points per pair for each right pair, and an
  // item left unpaired scores nothing. An answer that uses a right-hand item more often than it is
  // shown, which no phone can send, scores nothing, so a repeated text can't be collected for every
  // left-hand item.
  outcomes: ({ pairs, pointsPerPair }, answers) =>
    answers.map(({ rightByLeft }) => {
      const joined = rightByLeft.filter((right) => right !== null);
      const isFair = isDrawnFrom(joined, pairs.map((pair) => pair.right));
      const parts = pairs.map((pair, index): OutcomePart => {
        const given = rightByLeft[index] ?? "";
        return { label: pair.left, given, result: isFair && given === pair.right ? "right" : "wrong", correct: pair.right };
      });
      return { points: parts.filter((part) => part.result === "right").length * (pointsPerPair ?? 0), parts };
    }),
};
