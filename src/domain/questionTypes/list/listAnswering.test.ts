import { describe, expect, it } from "vitest";
import { pointsOf } from "@/domain/answering/outcome";
import type { ContentOf } from "@convex/questions/questionContent";
import { listAnswering } from "./listAnswering";

const content: ContentOf<"list"> = {
  type: "list",
  acceptedItems: [{ spellings: ["Göteborg", "Gbg"] }, { spellings: ["Malmö"] }],
  pointsPerItem: 0.5,
  fuzzy: true,
  aiAssist: false,
};
const listed = (...items: string[]) => ({ type: "list" as const, items });

describe("listAnswering", () => {
  it("shows nothing beyond the prompt while asked", () => {
    expect(listAnswering.show(content)).toEqual({ type: "list" });
    expect(listAnswering.startingAnswer({ type: "list" })).toBeNull();
  });

  it("can be sent once one answer is listed", () => {
    expect(listAnswering.isComplete({ type: "list" }, listed("Lund"))).toBe(true);
    expect(listAnswering.isComplete({ type: "list" }, listed(" "))).toBe(false);
  });

  it("scores each key item listed once, however it is spelled", () => {
    expect(pointsOf(listAnswering.outcomes(content, [listed("göteborg", "GBG", "Malmö."), listed("Lund")]))).toEqual([1, 0]);
  });

  it("counts right items outside the key by their names, two forms of one item once", () => {
    const verdicts = [
      { slot: 0, text: "lund", target: "Lund" },
      { slot: 0, text: "lunds stad", target: "lund" },
      { slot: 0, text: "gothenburg", target: 0 },
      { slot: 0, text: "uppsala", target: null },
    ];
    expect(pointsOf(listAnswering.outcomes(content, [listed("Lund", "Lunds stad", "Gothenburg", "Göteborg", "Uppsala")], verdicts))).toEqual([1]);
  });

  it("reveals the items the teams got right, most often first, and nothing without answers", () => {
    const graded = { answers: [listed("Malmö", "Lund"), listed("Malmö", "Gbg")], verdicts: [{ slot: 0, text: "lund", target: "Lund" }] };
    expect(listAnswering.reveal(content, graded)).toEqual({
      type: "list",
      items: [
        { name: "Malmö", teamCount: 2 },
        { name: "Göteborg", teamCount: 1 },
        { name: "Lund", teamCount: 1 },
      ],
    });
    expect(listAnswering.reveal(content)).toEqual({ type: "list", items: [] });
  });

  it("says what each item listed counted as", () => {
    const verdicts = [
      { slot: 0, text: "gothenburg", target: 0 },
      { slot: 0, text: "oslo", target: null },
    ];
    expect(listAnswering.outcomes(content, [listed("Göteborg", "Gothenburg", "Oslo", "Lund")], verdicts)[0].parts.map((part) => [part.given, part.result])).toEqual([
      ["Göteborg", "right"],
      ["Gothenburg", "repeat"],
      ["Oslo", "wrong"],
      ["Lund", "pending"],
    ]);
  });
});
