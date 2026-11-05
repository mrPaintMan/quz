import { describe, expect, it } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { numberAnswering } from "./numberAnswering";

const guess = (value: number | null) => ({ type: "number" as const, value });
const tiers: ContentOf<"number"> = {
  type: "number",
  answer: 100,
  scoring: {
    mode: "tiers",
    tiers: [
      { within: 0, points: 3 },
      { within: 5, points: 2 },
      { within: 10, points: 1 },
    ],
  },
};
const closest: ContentOf<"number"> = { type: "number", answer: 100, scoring: { mode: "closest", pointsByRank: [3, 2, 1] } };

describe("numberAnswering", () => {
  it("shows nothing but the question, and reveals the right number", () => {
    expect(numberAnswering.show(tiers)).toEqual({ type: "number" });
    expect(numberAnswering.reveal(tiers)).toEqual({ type: "number", answer: 100 });
    expect(numberAnswering.imageIds(tiers)).toEqual([]);
  });

  it("can be sent once a number is typed", () => {
    expect(numberAnswering.isComplete({ type: "number" }, guess(3.5))).toBe(true);
    expect(numberAnswering.isComplete({ type: "number" }, guess(null))).toBe(false);
  });

  it("gives the best level the guess is within, counting the edge as within", () => {
    expect(numberAnswering.grade(tiers, [guess(100), guess(95), guess(110), guess(111), guess(null)])).toEqual([3, 2, 1, 0, 0]);
  });

  it("isn't thrown off by floating point at a level's edge", () => {
    const decimals: ContentOf<"number"> = { type: "number", answer: 0.1, scoring: { mode: "tiers", tiers: [{ within: 0.3, points: 1 }] } };
    expect(numberAnswering.grade(decimals, [guess(0.4)])).toEqual([1]);
  });

  it("shares a place between equally close guesses to a large number", () => {
    const large: ContentOf<"number"> = { type: "number", answer: 100_000_000.3, scoring: { mode: "closest", pointsByRank: [3, 2] } };
    expect(numberAnswering.grade(large, [guess(100_000_000.2), guess(100_000_000.4)])).toEqual([3, 3]);
  });

  it("gives the closest teams the points by place", () => {
    expect(numberAnswering.grade(closest, [guess(90), guess(101), guess(150), guess(200)])).toEqual([2, 3, 1, 0]);
  });

  it("lets equally close guesses share a place and skips the place they take", () => {
    expect(numberAnswering.grade(closest, [guess(98), guess(102), guess(110)])).toEqual([3, 3, 1]);
  });

  it("scores nothing for a missing guess, which takes no place", () => {
    expect(numberAnswering.grade(closest, [guess(null), guess(120)])).toEqual([0, 3]);
  });
});
