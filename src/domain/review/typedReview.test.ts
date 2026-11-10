import { describe, expect, it } from "vitest";
import { gradeTyped, textsToReview, withVerdicts, type TypedReview } from "./typedReview";

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

describe("gradeTyped", () => {
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
      { slot: 1, text: "wodka", target: 0 },
      { slot: 0, text: "wodka", target: 0 },
    ];
    expect(withVerdicts(items, verdicts).map(({ text, isJudged, target }) => [text, isJudged, target])).toEqual([
      ["abbba", false, null],
      ["gin", true, null],
      ["wodka", true, 0],
    ]);
  });
});
