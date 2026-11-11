import { describe, expect, it } from "vitest";
import { pointsOf } from "@/domain/answering/outcome";
import type { ContentOf } from "@convex/questions/questionContent";
import { sortAnswering } from "./sortAnswering";

const content: ContentOf<"sort"> = {
  type: "sort",
  items: ["Titanic", "Avatar", "Oppenheimer"],
  firstLabel: "Äldst",
  lastLabel: "Nyast",
  pointsPerItem: 1,
};
const order = (...items: string[]) => ({ type: "sort" as const, order: items });

describe("sortAnswering", () => {
  it("shows the items shuffled, the same way every time, with the labels", () => {
    const shown = sortAnswering.show(content);
    expect(shown).toMatchObject({ type: "sort", firstLabel: "Äldst", lastLabel: "Nyast" });
    expect(shown.items).not.toEqual(content.items);
    expect([...shown.items].sort()).toEqual([...content.items].sort());
    expect(sortAnswering.show(content)).toEqual(shown);
  });

  it("reveals the right order", () => {
    expect(sortAnswering.reveal(content)).toEqual({ type: "sort", items: content.items, firstLabel: "Äldst", lastLabel: "Nyast" });
  });

  it("can be sent as any order of the items shown, each once", () => {
    const shown = sortAnswering.show(content);
    expect(sortAnswering.isComplete(shown, order("Avatar", "Titanic", "Oppenheimer"))).toBe(true);
    expect(sortAnswering.isComplete(shown, order("Avatar", "Avatar", "Oppenheimer"))).toBe(false);
    expect(sortAnswering.isComplete(shown, order("Avatar", "Titanic"))).toBe(false);
    expect(sortAnswering.isComplete(shown, order("Avatar", "Titanic", "Barbie"))).toBe(false);
  });

  it("scores the points per item for each item in its right place", () => {
    expect(
      pointsOf(sortAnswering.outcomes(content, [
        order("Titanic", "Avatar", "Oppenheimer"),
        order("Titanic", "Oppenheimer", "Avatar"),
        order("Oppenheimer", "Titanic", "Avatar"),
      ])),
    ).toEqual([3, 1, 0]);
  });

  it("shuffles the same whatever the right order, so the order shown gives nothing away", () => {
    const otherRightOrder = { ...content, items: ["Avatar", "Titanic", "Oppenheimer"] };
    expect(sortAnswering.show(otherRightOrder).items).toEqual(sortAnswering.show(content).items);
  });

  it("starts from the shuffled order, which can be sent as it is", () => {
    const shown = sortAnswering.show(content);
    expect(sortAnswering.startingAnswer(shown)).toEqual({ type: "sort", order: shown.items });
  });

  it("never shows the items in the right order", () => {
    for (const items of [["A", "B"], ["B", "A"], ["Titanic", "Avatar", "Oppenheimer", "Frost"]]) {
      expect(sortAnswering.show({ ...content, items }).items).not.toEqual(items);
    }
  });

  it("isn't fooled by items with line breaks", () => {
    const shown = { ...sortAnswering.show(content), items: ["a\nb", "c"] };
    expect(sortAnswering.isComplete(shown, order("a", "b\nc"))).toBe(false);
  });

  it("says for each place what the team put there and what belongs there", () => {
    expect(sortAnswering.outcomes(content, [order("Titanic", "Oppenheimer", "Avatar")])[0].parts).toEqual([
      { label: "1.", given: "Titanic", result: "right", correct: "Titanic" },
      { label: "2.", given: "Oppenheimer", result: "wrong", correct: "Avatar" },
      { label: "3.", given: "Avatar", result: "wrong", correct: "Oppenheimer" },
    ]);
  });
});
