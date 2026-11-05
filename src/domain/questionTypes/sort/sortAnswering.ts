import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { shuffleStably } from "@/domain/ordering/shuffleStably";

type SortLabels = { firstLabel: string; lastLabel: string };

// While asked, the items in a shuffled order that is the same for every phone and the TV; on the
// answer screen, in the right order. Labels say what the top and the bottom mean.
export type SortShown = SortLabels & { type: "sort"; items: string[] };
export type SortRevealed = SortLabels & { type: "sort"; items: string[] };

// An order is complete when it holds each item shown exactly once.
const isOrderOf = (order: string[], items: string[]) => order.length === items.length && [...order].sort().join("\n") === [...items].sort().join("\n");

export const sortAnswering: AnsweringRules<"sort", SortShown, SortRevealed> = {
  // Seeded by the items, so the order stays put on every screen and after a reload (D46).
  show: ({ items, firstLabel, lastLabel }) => ({ type: "sort", items: shuffleStably(items, items.join("\n")), firstLabel, lastLabel }),
  reveal: ({ items, firstLabel, lastLabel }) => ({ type: "sort", items, firstLabel, lastLabel }),
  imageIds: () => [],
  isComplete: (shown, { order }) => isOrderOf(order, shown.items),
  // The points per item for each item in its right place.
  grade: ({ items, pointsPerItem }, answers) =>
    answers.map(({ order }) => order.filter((item, index) => item === items[index]).length * (pointsPerItem ?? 0)),
};
