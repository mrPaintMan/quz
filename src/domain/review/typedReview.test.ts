import { describe, expect, it } from "vitest";
import { givenNames, rightItems, sortTexts, textOutcomes, textsToReview, withVerdicts, type TypedReview } from "./typedReview";

// Two slots: a field with one option, and a pool of two options in any order.
type Content = { points: number };
type Answer = { first: string; pool: string[] };
const review: TypedReview<Content, Answer> = {
  slots: () => [
    { title: "a) Artist", options: [{ label: "ABBA", spellings: ["ABBA"] }] },
    {
      title: "",
      options: [
        { label: "Vodka", spellings: ["Vodka"] },
        { label: "Kahlúa", spellings: ["Kahlúa", "kaffelikör"] },
      ],
    },
  ],
  texts: ({ first, pool }) => [{ slot: 0, text: first }, ...pool.map((text) => ({ slot: 1, text }))],
  pointsPerMatch: ({ points }) => points,
};
const content = { points: 2 };
const answer = (first: string, ...pool: string[]) => ({ first, pool });

// Each answer's points, as textOutcomes counts them.
function gradeTyped<A>(typed: TypedReview<Content, A>, of: Content, answers: A[], verdicts: Parameters<typeof textOutcomes>[3]) {
  return textOutcomes(typed, of, answers, verdicts).map((outcome) => outcome.points);
}

describe("textOutcomes", () => {
  it("says what each text counted as, in the order written", () => {
    const verdicts = [
      { slot: 1, text: "wodka", target: 0 },
      { slot: 1, text: "mjölk", target: null },
    ];
    const [outcome] = textOutcomes(review, content, [answer("ABBA", "Vodka", "wodka", "mjölk", "gin")], verdicts);
    expect(outcome.texts.map(({ key: _key, ...text }) => text)).toEqual([
      { slot: 0, written: "ABBA", result: "right", item: "ABBA" },
      { slot: 1, written: "Vodka", result: "right", item: "Vodka" },
      { slot: 1, written: "wodka", result: "repeat", item: "Vodka" },
      { slot: 1, written: "mjölk", result: "wrong", item: "" },
      { slot: 1, written: "gin", result: "pending", item: "" },
    ]);
    expect(outcome.points).toBe(4);
    // A repeat is the same item as the text it repeats.
    expect(outcome.texts[2].key).toBe(outcome.texts[1].key);
  });
});

describe("grading typed texts", () => {
  it("scores each option matched by an exact spelling, once however often it is written", () => {
    expect(gradeTyped(review, content, [answer("abba.", "vodka", "Vodka", "KAFFELIKÖR")], [])).toEqual([6]);
  });

  it("counts a text by the hosts' verdict, in its own slot only", () => {
    const verdicts = [
      { slot: 0, text: "abbba", target: 0 },
      { slot: 1, text: "wodka", target: 0 },
      { slot: 1, text: "mjölk", target: null },
    ];
    expect(gradeTyped(review, content, [answer("Abbba", "Wodka", "mjölk"), answer("wodka", "abbba")], verdicts)).toEqual([4, 0]);
  });

  it("lets an exact spelling win over a verdict, and doesn't count a verdict and a spelling of the same option twice", () => {
    const verdicts = [
      { slot: 1, text: "vodka", target: null },
      { slot: 1, text: "wodka", target: 0 },
    ];
    expect(gradeTyped(review, content, [answer("", "vodka", "wodka")], verdicts)).toEqual([2]);
  });

  it("scores nothing for unjudged texts, blanks, slots that don't exist or a verdict naming an option that is gone", () => {
    const outside: TypedReview<Content, Answer> = { ...review, texts: () => [{ slot: 5, text: "ABBA" }] };
    expect(gradeTyped(outside, content, [answer("")], [])).toEqual([0]);
    expect(gradeTyped(review, content, [answer(" ", "gin")], [{ slot: 1, text: "gin", target: 7 }])).toEqual([0]);
  });
});

describe("textsToReview", () => {
  it("lists each text without an exact match once per slot, with how many teams wrote it and how it was first written", () => {
    const answers = [answer(" Abbba ", "Wodka", "wodka", "vodka"), answer("abbba", "Gin"), answer("ABBA", "")];
    expect(textsToReview(review, content, answers)).toEqual([
      { slot: 0, text: "abbba", written: "Abbba", teamCount: 2 },
      { slot: 1, text: "gin", written: "Gin", teamCount: 1 },
      { slot: 1, text: "wodka", written: "Wodka", teamCount: 1 },
    ]);
  });

  it("leaves out texts in a slot without accepted answers, as nothing can count them", () => {
    const empty: TypedReview<Content, Answer> = { ...review, slots: () => [{ title: "", options: [] }] };
    expect(textsToReview(empty, content, [answer("gin")])).toEqual([]);
  });

  it("keeps the same text in two slots apart", () => {
    expect(textsToReview(review, content, [answer("gin", "gin")]).map((item) => item.slot)).toEqual([0, 1]);
  });
});

describe("withVerdicts", () => {
  it("adds the hosts' verdict so far to each text", () => {
    const items = [
      { slot: 0, text: "abbba", written: "Abbba", teamCount: 2 },
      { slot: 1, text: "gin", written: "Gin", teamCount: 1 },
      { slot: 1, text: "wodka", written: "Wodka", teamCount: 1 },
    ];
    const verdicts = [
      { slot: 1, text: "gin", target: null },
      { slot: 1, text: "wodka", target: 0, byAi: true },
      { slot: 0, text: "wodka", target: 0 },
    ];
    expect(withVerdicts(items, verdicts).map(({ text, isJudged, target, byAi }) => [text, isJudged, target, byAi])).toEqual([
      ["abbba", false, null, false],
      ["gin", true, null, false],
      ["wodka", true, 0, true],
    ]);
  });
});

describe("open slots", () => {
  type List = { items: string[] };
  const list: TypedReview<Content, List> = {
    slots: () => [{ title: "", options: [{ label: "Göteborg", spellings: ["Göteborg"] }], isOpen: true }],
    texts: ({ items }) => items.map((text) => ({ slot: 0, text })),
    pointsPerMatch: ({ points }) => points,
  };

  it("lists every text without an exact match for review, also with an empty key", () => {
    const empty: TypedReview<Content, List> = { ...list, slots: () => [{ title: "", options: [], isOpen: true }] };
    expect(textsToReview(empty, content, [{ items: ["Lund"] }]).map((item) => item.text)).toEqual(["lund"]);
  });

  it("counts a named item once, and a name that is a key spelling as that key item", () => {
    const verdicts = [
      { slot: 0, text: "lund", target: "Lund" },
      { slot: 0, text: "lunds stad", target: " LUND " },
      { slot: 0, text: "gothenburg", target: "göteborg" },
      { slot: 0, text: "blank", target: " " },
    ];
    expect(gradeTyped(list, content, [{ items: ["Lund", "Lunds stad", "Gothenburg", "Göteborg", "Blank"] }], verdicts)).toEqual([4]);
  });

  it("ignores a name in a slot that isn't open", () => {
    expect(gradeTyped(review, content, [answer("Abbba")], [{ slot: 0, text: "abbba", target: "ABBA-gruppen" }])).toEqual([0]);
  });

  it("keeps two key items apart even when they share a label", () => {
    const twins: TypedReview<Content, List> = {
      ...list,
      slots: () => [{ title: "", options: [{ label: "Anna", spellings: ["Anna Book"] }, { label: "Anna", spellings: ["Anna Bergendahl"] }], isOpen: true }],
    };
    expect(rightItems(twins, content, [{ items: ["Anna Book", "Anna Bergendahl"] }], [])).toEqual([
      { name: "Anna", teamCount: 1 },
      { name: "Anna", teamCount: 1 },
    ]);
  });

  it("names the items the teams got right by the key's label or the verdict's name", () => {
    const verdicts = [
      { slot: 0, text: "lund", target: "Lund" },
      { slot: 0, text: "gothenburg", target: 0 },
    ];
    expect(rightItems(list, content, [{ items: ["Gothenburg", "Lund"] }, { items: ["Göteborg"] }], verdicts)).toEqual([
      { name: "Göteborg", teamCount: 2 },
      { name: "Lund", teamCount: 1 },
    ]);
  });
});

describe("givenNames", () => {
  it("gives each name once per slot as first given, alphabetically, leaving out options and wrong", () => {
    const verdicts = [
      { slot: 0, text: "malmoe", target: " Malmö " },
      { slot: 0, text: "malmö", target: "malmö" },
      { slot: 0, text: "lund", target: "Lund" },
      { slot: 1, text: "lund", target: "Lund" },
      { slot: 0, text: "gbg", target: 0 },
      { slot: 0, text: "oslo", target: null },
    ];
    expect(givenNames(verdicts)).toEqual([
      { slot: 0, name: "Lund" },
      { slot: 0, name: "Malmö" },
      { slot: 1, name: "Lund" },
    ]);
  });
});

describe("sortTexts", () => {
  it("splits the texts into those to judge and those an accepted spelling matched, with the answer they are", () => {
    const answers = [answer("abba", "KAFFELIKÖR", "Vodka"), answer("ABBA.", "kaffelikör", "gin")];
    const { toReview, exact } = sortTexts(review, content, answers);
    expect(toReview).toEqual([{ slot: 1, text: "gin", written: "gin", teamCount: 1 }]);
    expect(exact).toEqual([
      { slot: 0, text: "abba", written: "abba", teamCount: 2, answer: "ABBA" },
      { slot: 1, text: "kaffelikör", written: "KAFFELIKÖR", teamCount: 2, answer: "Kahlúa" },
      { slot: 1, text: "vodka", written: "Vodka", teamCount: 1, answer: "Vodka" },
    ]);
  });
});
