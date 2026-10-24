import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import { describe, expect, it } from "vitest";
import { findScreenIndex } from "./findScreenIndex";

const question = (id: string): Screen => ({ kind: "question", questionId: id as Id<"questions"> });
const sequence: Screen[] = [{ kind: "lobby" }, question("q1"), question("q2"), { kind: "finalLeaderboard" }];

describe("findScreenIndex", () => {
  it("finds the screen by what it shows, even if its saved place is out of date", () => {
    expect(findScreenIndex(sequence, question("q2"), 0)).toBe(2);
  });

  it("falls back to the saved place when the screen is gone", () => {
    expect(findScreenIndex(sequence, question("raderad"), 1)).toBe(1);
  });

  it("stays inside the sequence when it has shrunk past the saved place", () => {
    expect(findScreenIndex(sequence, question("raderad"), 9)).toBe(3);
  });
});
