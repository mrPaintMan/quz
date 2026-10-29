import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setupConvexTest } from "../test.setup";
import { timerForScreen } from "./timerForScreen";

async function insertQuestion(t: ReturnType<typeof setupConvexTest>, timeLimitSeconds: number | null) {
  return t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Lekar", kind: "questions" });
    return ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "Pepparkakshus",
      timeLimitSeconds,
      media: null,
      hostNotes: "",
      content: { type: "activity", maxPoints: 5 },
    });
  });
}

// t.run hands back a Convex value, so "no timer" (undefined) arrives as null.
describe("timerForScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts the time limit of a question", async () => {
    const t = setupConvexTest();
    const questionId = await insertQuestion(t, 30);
    const timer = await t.run((ctx) => timerForScreen(ctx, { kind: "question", questionId }));
    expect(timer).toEqual({ kind: "running", endsAt: 130_000 });
  });

  it("gives no timer to a question without a time limit", async () => {
    const t = setupConvexTest();
    const questionId = await insertQuestion(t, null);
    await expect(t.run((ctx) => timerForScreen(ctx, { kind: "question", questionId }))).resolves.toBeNull();
  });

  it("gives no timer to the answer screen", async () => {
    const t = setupConvexTest();
    const questionId = await insertQuestion(t, 30);
    await expect(t.run((ctx) => timerForScreen(ctx, { kind: "answer", questionId }))).resolves.toBeNull();
  });
});
