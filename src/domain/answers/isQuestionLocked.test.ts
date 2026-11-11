import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { isQuestionLocked } from "./isQuestionLocked";

const q = (id: string) => id as Id<"questions">;

describe("isQuestionLocked", () => {
  it("is locked once closed by Nästa or locked by time-out or every team sending", () => {
    expect(isQuestionLocked({ closedQuestionIds: [q("a")] }, q("a"))).toBe(true);
    expect(isQuestionLocked({ lockedQuestionIds: [q("a")] }, q("a"))).toBe(true);
    expect(isQuestionLocked({ closedQuestionIds: [q("b")], lockedQuestionIds: [q("c")] }, q("a"))).toBe(false);
    expect(isQuestionLocked({}, q("a"))).toBe(false);
  });
});
