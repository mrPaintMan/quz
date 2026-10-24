import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import { describe, expect, it } from "vitest";
import { stepScreen } from "./stepScreen";

const question = (id: string): Screen => ({ kind: "question", questionId: id as Id<"questions"> });
const sequence: Screen[] = [{ kind: "lobby" }, { kind: "rules" }, question("q1"), { kind: "finalLeaderboard" }];

describe("stepScreen", () => {
  it("moves one screen forward or back", () => {
    expect(stepScreen(sequence, { screen: { kind: "rules" }, screenIndex: 1 }, 1)).toEqual({ screen: question("q1"), screenIndex: 2 });
    expect(stepScreen(sequence, { screen: { kind: "rules" }, screenIndex: 1 }, -1)).toEqual({ screen: { kind: "lobby" }, screenIndex: 0 });
  });

  it("stays put at either end", () => {
    expect(stepScreen(sequence, { screen: { kind: "lobby" }, screenIndex: 0 }, -1)).toEqual({ screen: { kind: "lobby" }, screenIndex: 0 });
    expect(stepScreen(sequence, { screen: { kind: "finalLeaderboard" }, screenIndex: 3 }, 1)).toEqual({
      screen: { kind: "finalLeaderboard" },
      screenIndex: 3,
    });
  });

  it("moves on from the screen that took the place of a deleted one", () => {
    expect(stepScreen(sequence, { screen: question("raderad"), screenIndex: 2 }, 1)).toEqual({
      screen: { kind: "finalLeaderboard" },
      screenIndex: 3,
    });
  });
});
