import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { shuffleStably } from "@/domain/ordering/shuffleStably";

type SortLabels = { firstLabel: string; lastLabel: string };

// While asked, the items in a shuffled order that is the same for every phone and the TV; on the
// answer screen, in the right order. Labels say what the top and the bottom mean.
export type SortShown = SortLabels & { type: "sort"; items: string[] };
export type SortRevealed = SortShown;

// An order is complete when it holds each item shown exactly once.
function isOrderOf(order: string[], items: string[]): boolean {
  const left = new Map<string, number>();
  for (const item of items) left.set(item, (left.get(item) ?? 0) + 1);
  for (const item of order) {
    const count = left.get(item) ?? 0;
    if (count === 0) return false;
    left.set(item, count - 1);
  }
  return order.length === items.length;
}

// The items shuffled from their alphabetical order and seeded by it, so the result says nothing
// about the right order: the phone runs the same shuffle, and could work the order back out of
// anything made from it. Should the shuffle land on the right order (1 in 120 for five items), it
// moves the first item last, so the question is never shown solved; only then does the order
// shown hint at the answer.
function shuffledFor(items: string[]): string[] {
  const alphabetical = [...items].sort();
  const shuffled = shuffleStably(alphabetical, alphabetical.join("\n"));
  const isSolved = shuffled.every((item, index) => item === items[index]);
  return isSolved && items.length > 1 ? [...shuffled.slice(1), shuffled[0]] : shuffled;
}

export const sortAnswering: AnsweringRules<"sort", SortShown, SortRevealed> = {
  // The same order on every screen and after a reload (D46).
  show: ({ items, firstLabel, lastLabel }) => ({ type: "sort", items: shuffledFor(items), firstLabel, lastLabel }),
  reveal: ({ items, firstLabel, lastLabel }) => ({ type: "sort", items, firstLabel, lastLabel }),
  imageIds: () => [],
  // The shuffled order can be sent as it is, though it is no draft until the team moves an item.
  startingAnswer: ({ items }) => ({ type: "sort", order: items }),
  isComplete: (shown, { order }) => isOrderOf(order, shown.items),
  // The points per item for each item in its right place.
  grade: ({ items, pointsPerItem }, answers) =>
    answers.map(({ order }) => order.filter((item, index) => item === items[index]).length * (pointsPerItem ?? 0)),
};
