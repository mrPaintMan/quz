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
      media: null,
      imageUrls: {},
      timer: null,
      playback: null,
      isQuestionClosed: false,
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
    expect(game?.view).toEqual({ kind: "question", roundNumber: 1, questionNumber: 1, prompt: "Vilken krydda?", answeredInApp: true, shown: { type: "freeText", labels: [""] } });
    expect(JSON.stringify(game)).not.toMatch(/kanel/i);
  });
});

async function insertQuizWithQuestion(t: ReturnType<typeof setupConvexTest>, withImage = false) {
  return t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["bild"]));
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz 2026", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
    const questionId = await ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "Pepparkakshus",
      timeLimitSeconds: 30,
      media: withImage ? { kind: "image", storageId } : null,
      hostNotes: "",
      content: { type: "activity", maxPoints: 5 },
    });
    return { quizId, roundId, questionId };
  });
}

describe("getRunningGame's media, timer and clip", () => {
  it("shows the media, timer and clip of the screen showing now", async () => {
    const t = setupConvexTest();
    const { quizId, questionId } = await insertQuizWithQuestion(t, true);
    const timer = { kind: "running" as const, endsAt: 130_000 };
    const playback = { kind: "paused" as const, positionMs: 2_000 };
    await t.run((ctx) =>
      ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3, timer, playback }),
    );
    const game = await t.query(api.games.queries.getRunningGame, {});
    expect(game).toMatchObject({ media: { kind: "image", url: expect.any(String) }, timer, playback, isQuestionClosed: false });
  });

  it("says when the question showing is closed to answers", async () => {
    const t = setupConvexTest();
    const { quizId, questionId } = await insertQuizWithQuestion(t);
    const screen = { kind: "question" as const, questionId };
    await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen, screenIndex: 3, closedQuestionIds: [questionId] }));
    expect((await t.query(api.games.queries.getRunningGame, {}))?.isQuestionClosed).toBe(true);
  });

  it("leaves out the timer and clip of a question deleted during the game", async () => {
    const t = setupConvexTest();
    const { quizId, questionId } = await insertQuizWithQuestion(t);
    await t.run(async (ctx) => {
      await ctx.db.insert("games", {
        quizId,
        endedAt: null,
        screen: { kind: "question", questionId },
        screenIndex: 3,
        timer: { kind: "running", endsAt: 130_000 },
        playback: { kind: "playing", startedAt: 100_000 },
      });
      await ctx.db.delete("questions", questionId);
    });
    const game = await t.query(api.games.queries.getRunningGame, {});
    expect(game?.screen).toEqual({ kind: "finalLeaderboard" });
    expect(game?.timer).toBeNull();
    expect(game?.playback).toBeNull();
  });
});

describe("getNextScreen", () => {
  it("describes the screen after the one showing now", async () => {
    const t = setupConvexTest();
    const { quizId } = await insertQuizWithQuestion(t);
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "rules" }, screenIndex: 1 }));
    await expect(t.query(api.games.queries.getNextScreen, { ...host, gameId })).resolves.toEqual({
      view: { kind: "roundIntro", roundNumber: 1, title: "Julmat" },
      media: null,
      imageUrls: {},
      notes: { current: null, next: null },
    });
  });

  it("gives the notes of the next screen's question, and of the question on the TV", async () => {
    const t = setupConvexTest();
    const { quizId, roundId, questionId } = await insertQuizWithQuestion(t);
    await t.run((ctx) => ctx.db.patch("questions", questionId, { hostNotes: "Alla upp och baka!" }));
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "roundIntro", roundId }, screenIndex: 2 }));
    const next = await t.query(api.games.queries.getNextScreen, { ...host, gameId });
    expect(next?.notes).toEqual({ current: null, next: { questionId, notes: "Alla upp och baka!", scoring: null } });
  });

  it("shows the next screen's media", async () => {
    const t = setupConvexTest();
    const { quizId, roundId } = await insertQuizWithQuestion(t, true);
    const gameId = await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "roundIntro", roundId }, screenIndex: 2 }));
    const next = await t.query(api.games.queries.getNextScreen, { ...host, gameId });
    expect(next?.media).toEqual({ kind: "image", url: expect.any(String) });
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

describe("getShowingTrip", () => {
  async function gameShowingTrip(endedAt: number | null = null) {
    const t = setupConvexTest();
    const gameId = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "På spåret", kind: "paSparet" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Vart är vi på väg?",
        timeLimitSeconds: null,
        media: { kind: "video", r2Key: "resa", posterId: null, durationSeconds: 120 },
        hostNotes: "",
        content: { type: "paSparet", acceptedAnswers: ["Oslo"], fuzzy: true, clues: ["a", "b", "c", "d", "e"] },
      });
      return ctx.db.insert("games", { quizId, endedAt, screen: { kind: "question", questionId }, screenIndex: 3 });
    });
    return { t, gameId };
  }

  it("gives the hosts the trip's clues and film length while it shows", async () => {
    const { t, gameId } = await gameShowingTrip();
    await expect(t.query(api.games.queries.getShowingTrip, { ...host, gameId })).resolves.toEqual({
      clues: ["a", "b", "c", "d", "e"],
      durationSeconds: 120,
    });
  });

  it("is null for a game that has ended", async () => {
    const { t, gameId } = await gameShowingTrip(1);
    await expect(t.query(api.games.queries.getShowingTrip, { ...host, gameId })).resolves.toBeNull();
  });

  it("refuses a wrong passphrase", async () => {
    const { t, gameId } = await gameShowingTrip();
    await expect(t.query(api.games.queries.getShowingTrip, { hostPassphrase: "fel", gameId })).rejects.toThrow("Fel lösenord.");
  });
});

describe("getNextPictureUrls", () => {
  it("links the next screen's pictures, for the TV to load ahead", async () => {
    const t = setupConvexTest();
    const { quizId, roundId } = await insertQuizWithQuestion(t, true);
    await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "roundIntro", roundId }, screenIndex: 2 }));
    await expect(t.query(api.games.queries.getNextPictureUrls, {})).resolves.toEqual([expect.any(String)]);
  });

  it("is empty without a running game or a picture next", async () => {
    const t = setupConvexTest();
    await expect(t.query(api.games.queries.getNextPictureUrls, {})).resolves.toEqual([]);
    const { quizId } = await insertQuizWithQuestion(t);
    await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, ...atLobby }));
    await expect(t.query(api.games.queries.getNextPictureUrls, {})).resolves.toEqual([]);
  });
});
