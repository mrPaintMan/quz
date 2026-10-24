import type { Id } from "@convex/_generated/dataModel";
import type { Screen } from "@convex/games/screen";
import { describe, expect, it } from "vitest";
import { isSameScreen } from "./isSameScreen";

const question = (id: string): Screen => ({ kind: "question", questionId: id as Id<"questions"> });

describe("isSameScreen", () => {
  it("matches screens that show the same thing", () => {
    expect(isSameScreen(question("q1"), question("q1"))).toBe(true);
    expect(isSameScreen({ kind: "lobby" }, { kind: "lobby" })).toBe(true);
  });

  it("ignores the order the fields were stored in", () => {
    const stored = { questionId: "q1", kind: "question" } as Screen;
    expect(isSameScreen(stored, question("q1"))).toBe(true);
  });

  it("tells apart another kind or another question", () => {
    expect(isSameScreen(question("q1"), question("q2"))).toBe(false);
    expect(isSameScreen(question("q1"), { kind: "answer", questionId: "q1" as Id<"questions"> })).toBe(false);
  });
});
