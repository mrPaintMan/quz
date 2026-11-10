import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import { moveScreen } from "./moveScreen";

describe("moveScreen", () => {
  // Keeps convex-test from running a queued AI judge on its own.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves the new screen with its place in the sequence", async () => {
    const t = setupConvexTest();
    const game = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      await moveScreen(ctx, gameId, { kind: "lobby" }, 1);
      return ctx.db.get("games", gameId);
    });
    expect(game).toMatchObject({ screen: { kind: "rules" }, screenIndex: 1 });
  });

  it("does nothing when the game has already moved on from the screen the host saw", async () => {
    const t = setupConvexTest();
    const game = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby });
      await moveScreen(ctx, gameId, { kind: "lobby" }, 1);
      await moveScreen(ctx, gameId, { kind: "lobby" }, 1);
      return ctx.db.get("games", gameId);
    });
    expect(game).toMatchObject({ screen: { kind: "rules" }, screenIndex: 1 });
  });

  it("asks the AI judge the first time Nästa closes a typed question, not when it closes again", async () => {
    const t = setupConvexTest();
    const scheduled = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const content = { type: "freeText" as const, fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
      const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Vilken krydda?", timeLimitSeconds: null, media: null, hostNotes: "", content });
      const onQuestion = { kind: "question" as const, questionId };
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: onQuestion, screenIndex: 3 });
      await moveScreen(ctx, gameId, onQuestion, 1);
      await moveScreen(ctx, gameId, { kind: "answer", questionId }, -1);
      await moveScreen(ctx, gameId, onQuestion, 1);
      return ctx.db.system.query("_scheduled_functions").collect();
    });
    expect(scheduled.map((job) => job.name)).toEqual(["aiJudge/judge:judgeQuestion"]);
  });
});
