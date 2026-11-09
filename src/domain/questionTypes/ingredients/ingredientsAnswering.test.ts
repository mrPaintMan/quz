import { describe, expect, it } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { ingredientsAnswering } from "./ingredientsAnswering";

const content: ContentOf<"ingredients"> = {
  type: "ingredients",
  items: [{ spellings: ["Vodka"] }, { spellings: ["Kahlúa", "Kahlua", "kaffelikör"] }, { spellings: ["Grädde"] }],
  pointsPerItem: 1,
  fuzzy: true,
};
const guesses = (...items: string[]) => ({ type: "ingredients" as const, items });

describe("ingredientsAnswering", () => {
  it("shows only how many ingredients there are", () => {
    expect(ingredientsAnswering.show(content)).toEqual({ type: "ingredients", count: 3 });
  });

  it("reveals each ingredient by its first filled-in spelling", () => {
    expect(ingredientsAnswering.reveal(content)).toEqual({ type: "ingredients", items: ["Vodka", "Kahlúa", "Grädde"] });
    expect(ingredientsAnswering.reveal({ ...content, items: [{ spellings: ["", " Is "] }] })).toEqual({ type: "ingredients", items: ["Is"] });
  });

  it("starts with nothing written", () => {
    expect(ingredientsAnswering.startingAnswer({ type: "ingredients", count: 3 })).toBeNull();
  });

  it("can be sent with empty rows, as long as one is filled in", () => {
    const shown = ingredientsAnswering.show(content);
    expect(ingredientsAnswering.isComplete(shown, guesses("vodka", "", ""))).toBe(true);
    expect(ingredientsAnswering.isComplete(shown, guesses(" ", "", ""))).toBe(false);
    expect(ingredientsAnswering.isComplete(shown, guesses("vodka"))).toBe(false);
  });

  it("scores each ingredient guessed, in any order and by any accepted spelling", () => {
    expect(ingredientsAnswering.grade(content, [guesses("grädde", "KAFFELIKÖR.", "vodka"), guesses("mjölk", "", "Vodka ")])).toEqual([3, 1]);
  });

  it("counts an ingredient once, however often it is written", () => {
    expect(ingredientsAnswering.grade(content, [guesses("vodka", "Vodka", "vodka")])).toEqual([1]);
  });

  it("never counts an empty field, even against a spelling of only a full stop", () => {
    const odd = { ...content, items: [{ spellings: ["."] }, { spellings: ["Vodka"] }] };
    expect(ingredientsAnswering.grade(odd, [guesses("", "vodka")])).toEqual([1]);
  });

  it("doesn't count a misspelling yet", () => {
    expect(ingredientsAnswering.grade(content, [guesses("wodka", "", "")])).toEqual([0]);
  });
});
