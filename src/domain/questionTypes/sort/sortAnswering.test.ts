import { describe, expect, it } from "vitest";
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
      sortAnswering.grade(content, [
        order("Titanic", "Avatar", "Oppenheimer"),
        order("Titanic", "Oppenheimer", "Avatar"),
        order("Oppenheimer", "Titanic", "Avatar"),
      ]),
    ).toEqual([3, 1, 0]);
  });
});
