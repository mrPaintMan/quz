import { describe, expect, it } from "vitest";
import { startTimer } from "./startTimer";

describe("startTimer", () => {
  it("runs until the time limit has passed", () => {
    expect(startTimer(30, 1_000)).toEqual({ kind: "running", endsAt: 31_000 });
  });

  it.each([null, 0])("gives no timer for a time limit of %s", (timeLimitSeconds) => {
    expect(startTimer(timeLimitSeconds, 1_000)).toBeUndefined();
  });
});
