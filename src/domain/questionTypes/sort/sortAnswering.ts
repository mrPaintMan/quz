import type { AnsweringRules } from "@/domain/answering/answeringRules";
import type { OutcomePart } from "@/domain/answering/outcome";
import { isDrawnFrom } from "@/domain/ordering/isDrawnFrom";
import { shuffleUnsolved } from "@/domain/ordering/shuffleUnsolved";

type SortLabels = { firstLabel: string; lastLabel: string };

// While asked, the items in a shuffled order that is the same for every phone and the TV; on the
// answer screen, in the right order. Labels say what the top and the bottom mean.
export type SortShown = SortLabels & { type: "sort"; items: string[] };
export type SortRevealed = SortShown;

// An order is complete when it holds each item shown exactly once.
const isOrderOf = (order: string[], items: string[]) => order.length === items.length && isDrawnFrom(order, items);

export const sortAnswering: AnsweringRules<"sort", SortShown, SortRevealed> = {
  // The same order on every screen and after a reload (D46).
  show: ({ items, firstLabel, lastLabel }) => ({ type: "sort", items: shuffleUnsolved(items), firstLabel, lastLabel }),
  reveal: ({ items, firstLabel, lastLabel }) => ({ type: "sort", items, firstLabel, lastLabel }),
  imageIds: () => [],
  // The shuffled order can be sent as it is, though it is no draft until the team moves an item.
  startingAnswer: ({ items }) => ({ type: "sort", order: items }),
  isComplete: (shown, { order }) => isOrderOf(order, shown.items),
  // The points per item for each item in its right place.
  outcomes: ({ items, pointsPerItem }, answers) =>
    answers.map(({ order }) => {
      const parts = items.map((correct, index): OutcomePart => {
        const given = order[index] ?? "";
        const isRight = given === correct;
        return { label: `${index + 1}.`, given, result: isRight ? "right" : "wrong", correct, points: isRight ? (pointsPerItem ?? 0) : 0 };
      });
      return { points: parts.reduce((sum, part) => sum + part.points, 0), parts };
    }),
};
