import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { isQuestionClosed } from "./isQuestionClosed";

const q1 = "q1" as Id<"questions">;

describe("isQuestionClosed", () => {
  it("holds once the hosts have stepped on from the question", () => {
    expect(isQuestionClosed({ closedQuestionIds: [q1] }, q1)).toBe(true);
  });

  it("doesn't before, nor for a game that has closed none", () => {
    expect(isQuestionClosed({ closedQuestionIds: ["q2" as Id<"questions">] }, q1)).toBe(false);
    expect(isQuestionClosed({}, q1)).toBe(false);
  });
});
