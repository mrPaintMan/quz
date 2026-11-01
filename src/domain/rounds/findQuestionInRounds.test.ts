import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { findQuestionInRounds } from "./findQuestionInRounds";

const first = { _id: "q1" as Id<"questions">, prompt: "Först" };
const second = { _id: "q2" as Id<"questions">, prompt: "Sedan" };
const rounds = [{ questions: [first] }, { questions: [second] }];

describe("findQuestionInRounds", () => {
  it("finds a question in any round", () => {
    expect(findQuestionInRounds(rounds, second._id)).toBe(second);
  });

  it("is undefined for a question that isn't there", () => {
    expect(findQuestionInRounds(rounds, "q3" as Id<"questions">)).toBeUndefined();
  });
});
