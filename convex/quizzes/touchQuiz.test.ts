import { describe, expect, it, vi } from "vitest";
import { setupConvexTest } from "../test.setup";
import { touchQuiz } from "./touchQuiz";

describe("touchQuiz", () => {
  it("sets the quiz's updatedAt to now", async () => {
    vi.useFakeTimers({ now: 1_000 });
    const t = setupConvexTest();
    const updatedAt = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      await touchQuiz(ctx, quizId);
      return (await ctx.db.get("quizzes", quizId))?.updatedAt;
    });
    vi.useRealTimers();
    expect(updatedAt).toBe(1_000);
  });
});
