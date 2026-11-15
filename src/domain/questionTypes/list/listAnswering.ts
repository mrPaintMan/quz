import type { AnswerOf } from "@convex/answers/answerContent";
import type { ContentOf } from "@convex/questions/questionContent";
import type { AnsweringRules } from "@/domain/answering/answeringRules";
import { firstFilledIn } from "@/domain/questionTypes/firstFilledIn";
import { isBlank } from "@/domain/questionTypes/isBlank";
import { normalizeForComparison } from "@/domain/questionTypes/normalizeForComparison";
import { itemOutcomes, rightItems, type TypedReview } from "@/domain/review/typedReview";

// The most a team may list; far more than a real team writes, and it bounds what the server and
// the AI judge read (D53).
export const MAX_LIST_ITEMS = 100;

// Nothing is shown while asked beyond the prompt; the answer screen shows each item the teams got
// right with how many teams got it, filling in as verdicts arrive (D53), and after them up to
// MAX_OTHER_ITEMS of the key's items no team gave, in the key's order (D66).
export type ListShown = { type: "list" };
export type ListRevealed = { type: "list"; items: { name: string; teamCount: number }[]; others: string[] };

export const MAX_OTHER_ITEMS = 20;

// One open slot: the key may be incomplete, so a right item outside it counts too, under the name
// its verdict gives, and two forms of one item count once (D53).
const listReview: TypedReview<ContentOf<"list">, AnswerOf<"list">> = {
  slots: ({ acceptedItems }) => [
    {
      title: "",
      options: acceptedItems.map((item) => ({ label: firstFilledIn(item.spellings), spellings: item.spellings })),
      isOpen: true,
    },
  ],
  texts: ({ items }) => items.map((text) => ({ slot: 0, text })),
  pointsPerMatch: ({ pointsPerItem }) => pointsPerItem ?? 0,
};

export const listAnswering: AnsweringRules<"list", ListShown, ListRevealed> = {
  show: () => ({ type: "list" }),
  reveal: (content, graded) => {
    const items = graded ? rightItems(listReview, content, graded.answers, graded.verdicts) : [];
    const given = new Set(items.map((item) => normalizeForComparison(item.name)));
    const others = content.acceptedItems
      .map((item) => firstFilledIn(item.spellings))
      .filter((name) => name !== "" && !given.has(normalizeForComparison(name)))
      .slice(0, MAX_OTHER_ITEMS);
    return { type: "list", items, others };
  },
  revealsAnswers: true,
  imageIds: () => [],
  startingAnswer: () => null,
  // The server also caps the items and their length (fitsAnswerLimits).
  isComplete: (_shown, { items }) => items.some((item) => !isBlank(item)),
  // The points per item for each distinct item listed: by an exact spelling of the key, or by a
  // verdict (D51, D53).
  // One part per text written, blanks left out; another form of a counted item is a repeat.
  outcomes: (content, answers, verdicts = []) => itemOutcomes(listReview, content, answers, verdicts),
  review: listReview,
};
