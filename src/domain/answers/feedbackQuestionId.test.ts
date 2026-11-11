import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { feedbackQuestionId } from "./feedbackQuestionId";

const q = (id: string) => id as Id<"questions">;
const closed = [q("q1"), q("q2")];

describe("feedbackQuestionId", () => {
  it("is the question on the answer screen", () => {
    expect(feedbackQuestionId({ screen: { kind: "answer", questionId: q("q1") }, closedQuestionIds: closed })).toBe("q1");
  });

  it("is the last question closed on the screens after it", () => {
    expect(feedbackQuestionId({ screen: { kind: "finalLeaderboard" }, closedQuestionIds: closed })).toBe("q2");
  });

  it("is none while a question shows or before any is closed", () => {
    expect(feedbackQuestionId({ screen: { kind: "question", questionId: q("q3") }, closedQuestionIds: closed })).toBeNull();
    expect(feedbackQuestionId({ screen: { kind: "rules" } })).toBeNull();
  });
});
