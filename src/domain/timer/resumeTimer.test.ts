import { describe, expect, it } from "vitest";
import { resumeTimer } from "./resumeTimer";

describe("resumeTimer", () => {
  it("runs on with the time that was left", () => {
    expect(resumeTimer({ kind: "paused", remainingMs: 20_000 }, 50_000)).toEqual({ kind: "running", endsAt: 70_000 });
  });

  it("leaves a running timer as it is", () => {
    const running = { kind: "running" as const, endsAt: 31_000 };
    expect(resumeTimer(running, 50_000)).toBe(running);
  });
});
