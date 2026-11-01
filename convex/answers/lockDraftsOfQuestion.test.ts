import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setupConvexTest } from "../test.setup";
import { lockDraftsOfQuestion } from "./lockDraftsOfQuestion";

describe("lockDraftsOfQuestion", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
  });

  afterEach(() => vi.useRealTimers());

  it("locks the question's drafts as they are, and leaves sent answers and other questions alone", async () => {
    const t = setupConvexTest();
    const lockedAt = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Siffror", kind: "questions" });
      const question = {
        quizId,
        roundId,
        prompt: "Hur många?",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "number" as const, answer: 9, scoring: { mode: "closest" as const, pointsByRank: [3] } },
      };
      const questionId = await ctx.db.insert("questions", { ...question, position: 0 });
      const otherId = await ctx.db.insert("questions", { ...question, position: 1 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "lobby" }, screenIndex: 0 });
      const [red, blue] = await Promise.all([
        ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" }),
        ctx.db.insert("teams", { gameId, name: "Blå", colour: "blue" }),
      ]);
      const content = { type: "number" as const, value: 7 };
      const draft = await ctx.db.insert("answers", { gameId, teamId: red, questionId, content, lockedAt: null });
      const sent = await ctx.db.insert("answers", { gameId, teamId: blue, questionId, content, lockedAt: 50_000 });
      const other = await ctx.db.insert("answers", { gameId, teamId: red, questionId: otherId, content, lockedAt: null });
      await lockDraftsOfQuestion(ctx, gameId, questionId);
      return Promise.all([draft, sent, other].map(async (id) => (await ctx.db.get("answers", id))?.lockedAt));
    });
    expect(lockedAt).toEqual([100_000, 50_000, null]);
  });
});
