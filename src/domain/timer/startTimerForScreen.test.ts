import { describe, expect, it } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { startTimerForScreen } from "./startTimerForScreen";

const timed = "q1" as Id<"questions">;
const untimed = "q2" as Id<"questions">;
const rounds = [{ questions: [{ _id: timed, timeLimitSeconds: 30 }, { _id: untimed, timeLimitSeconds: null }] }];

describe("startTimerForScreen", () => {
  it("starts the time limit of a question", () => {
    expect(startTimerForScreen({ kind: "question", questionId: timed }, rounds, 100_000)).toEqual({ kind: "running", endsAt: 130_000 });
  });

  it("gives no timer to a question without a time limit", () => {
    expect(startTimerForScreen({ kind: "question", questionId: untimed }, rounds, 100_000)).toBeUndefined();
  });

  it("gives no timer to the answer screen", () => {
    expect(startTimerForScreen({ kind: "answer", questionId: timed }, rounds, 100_000)).toBeUndefined();
  });
});
