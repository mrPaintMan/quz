import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { atLobby, host, setupConvexTest } from "../test.setup";

describe("getRunningGame", () => {
  it("returns null when no game is running", async () => {
    const t = setupConvexTest();
    await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2025", year: 2025, updatedAt: 0 });
      await ctx.db.insert("games", { quizId, endedAt: 1, ...atLobby });
    });
    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toBeNull();
  });

  it("shows the running game's quiz and screen, and nothing else of the quiz", async () => {
    const t = setupConvexTest();
    const { gameId, quizId } = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2026", year: 2026, updatedAt: 0 });
      return { quizId, gameId: await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby }) };
    });
    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toEqual({
      _id: gameId,
      quizId,
      quizTitle: "Julquiz 2026",
      screen: { kind: "lobby" },
      view: { kind: "lobby" },
      timer: null,
    });
  });

  it("describes the screen without its answer key", async () => {
    const t = setupConvexTest();
    await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2026", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Vilken krydda?",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "Kanel, inte kardemumma",
        content: { type: "freeText", fields: [{ label: "", acceptedAnswers: ["kanel"] }], pointsPerField: 1, fuzzy: true },
      });
      await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
    });
    const game = await t.query(api.games.queries.getRunningGame, {});
    expect(game?.view).toEqual({ kind: "question", roundNumber: 1, questionNumber: 1, prompt: "Vilken krydda?", answeredInApp: true });
    expect(JSON.stringify(game)).not.toMatch(/kanel/i);
  });
});

async function insertQuizWithQuestion(t: ReturnType<typeof setupConvexTest>) {
  return t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2026", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
    const questionId = await ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "Pepparkakshus",
      timeLimitSeconds: 30,
      media: null,
      hostNotes: "",
      content: { type: "activity", maxPoints: 5 },
    });
    return { quizId, roundId, questionId };
  });
}

describe("getRunningGame's timer", () => {
  it("shows the timer of the screen showing now", async () => {
    const t = setupConvexTest();
    const { quizId, questionId } = await insertQuizWithQuestion(t);
    const timer = { kind: "running" as const, endsAt: 130_000 };
    await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3, timer }));
    expect((await t.query(api.games.queries.getRunningGame, {}))?.timer).toEqual(timer);
  });

  it("leaves out the timer of a question deleted during the game", async () => {
    const t = setupConvexTest();
    const { quizId, questionId } = await insertQuizWithQuestion(t);
    await t.run(async (ctx) => {
      await ctx.db.insert("games", {
        quizId,
        endedAt: null,
        screen: { kind: "question", questionId },
        screenIndex: 3,
        timer: { kind: "running", endsAt: 130_000 },
      });
      await ctx.db.delete("questions", questionId);
    });
    const game = await t.query(api.games.queries.getRunningGame, {});
    expect(game?.screen).toEqual({ kind: "finalLeaderboard" });
    expect(game?.timer).toBeNull();
  });
});

describe("getNextScreen", () => {
  it("describes the screen after the one showing now", async () => {
    const t = setupConvexTest();
    const { quizId } = await insertQuizWithQuestion(t);
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "rules" }, screenIndex: 1 }));
    await expect(t.query(api.games.queries.getNextScreen, { ...host, gameId })).resolves.toEqual({
      kind: "roundIntro",
      roundNumber: 1,
      title: "Julmat",
    });
  });

  it("is null after the last screen", async () => {
    const t = setupConvexTest();
    const { quizId } = await insertQuizWithQuestion(t);
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "finalLeaderboard" }, screenIndex: 4 }));
    await expect(t.query(api.games.queries.getNextScreen, { ...host, gameId })).resolves.toBeNull();
  });

  it("is null for a game that has ended", async () => {
    const t = setupConvexTest();
    const { quizId } = await insertQuizWithQuestion(t);
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: 1, ...atLobby }));
    await expect(t.query(api.games.queries.getNextScreen, { ...host, gameId })).resolves.toBeNull();
  });

  it("refuses a wrong passphrase", async () => {
    const t = setupConvexTest();
    const { quizId } = await insertQuizWithQuestion(t);
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, ...atLobby }));
    await expect(t.query(api.games.queries.getNextScreen, { hostPassphrase: "fel", gameId })).rejects.toThrow("Fel lösenord.");
  });
});
