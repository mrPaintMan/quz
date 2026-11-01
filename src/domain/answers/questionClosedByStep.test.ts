import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { questionClosedByStep } from "./questionClosedByStep";

const questionId = "q1" as Id<"questions">;

describe("questionClosedByStep", () => {
  it("closes a question when stepping on from it", () => {
    expect(questionClosedByStep({ kind: "question", questionId }, 1)).toBe(questionId);
  });

  it("leaves it open when stepping back from it", () => {
    expect(questionClosedByStep({ kind: "question", questionId }, -1)).toBeNull();
  });

  it("closes nothing when stepping from another screen", () => {
    expect(questionClosedByStep({ kind: "answer", questionId }, 1)).toBeNull();
  });
});
