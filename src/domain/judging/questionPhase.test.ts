import { describe, expect, it } from "vitest";
import { canStepOn, questionPhase } from "./questionPhase";

const locked = { isLocked: true, usesAiJudge: true, aiStatus: "done" as const, unjudged: 2 };

describe("questionPhase", () => {
  it("is open until the answers lock", () => {
    expect(questionPhase({ ...locked, isLocked: false })).toBe("open");
  });

  it("is judging while the AI judge works, and reviewing when texts are left after it", () => {
    expect(questionPhase({ ...locked, aiStatus: "judging" })).toBe("judging");
    expect(questionPhase(locked)).toBe("reviewing");
    expect(questionPhase({ ...locked, aiStatus: "failed" })).toBe("reviewing");
    expect(questionPhase({ ...locked, aiStatus: null })).toBe("reviewing");
  });

  it("is settled once every text is judged, even before the AI judge reports back", () => {
    expect(questionPhase({ ...locked, unjudged: 0 })).toBe("settled");
    expect(questionPhase({ ...locked, aiStatus: "judging", unjudged: 0 })).toBe("settled");
  });

  it("is settled at once for a question without the AI judge", () => {
    expect(questionPhase({ ...locked, usesAiJudge: false })).toBe("settled");
  });
});

describe("canStepOn", () => {
  it("lets the hosts step on from an open or settled question, not while answers are judged", () => {
    expect(canStepOn("open")).toBe(true);
    expect(canStepOn("settled")).toBe(true);
    expect(canStepOn("judging")).toBe(false);
    expect(canStepOn("reviewing")).toBe(false);
  });
});
