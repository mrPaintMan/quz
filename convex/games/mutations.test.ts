import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { host, setupConvexTest } from "../test.setup";

async function setupQuiz(prompt = "Pepparkakshus") {
  const t = setupConvexTest();
  const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz 2026", year: 2026 });
  const roundId = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmat" });
  const questionId = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId, type: "activity" });
  await t.mutation(api.questions.mutations.updateQuestion, { ...host, questionId, prompt });
  return { t, quizId, roundId, questionId };
}

describe("startGame", () => {
  it("starts a game of a ready quiz", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toEqual({
      _id: gameId,
      quizId,
      quizTitle: "Julquiz 2026",
      screen: { kind: "lobby" },
      view: { kind: "lobby" },
      media: null,
      timer: null,
      playback: null,
    });
  });

  it("ends the running game, so only one game runs at a time", async () => {
    const { t, quizId } = await setupQuiz();
    const firstId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    const secondId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    const first = await t.run((ctx) => ctx.db.get("games", firstId));
    expect(first?.endedAt).toEqual(expect.any(Number));
    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toMatchObject({ _id: secondId });
  });

  it("refuses a quiz without questions", async () => {
    const t = setupConvexTest();
    const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Tomt", year: 2026 });
    await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmat" });
    await expect(t.mutation(api.games.mutations.startGame, { ...host, quizId })).rejects.toThrow(
      "Lägg till minst en fråga innan quizet startar.",
    );
  });

  it("refuses a quiz with questions left to fill in", async () => {
    const { t, quizId, roundId } = await setupQuiz("");
    await expect(t.mutation(api.games.mutations.startGame, { ...host, quizId })).rejects.toThrow(
      "1 fråga behöver fyllas i innan quizet startar.",
    );
    await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId, type: "activity" });
    await expect(t.mutation(api.games.mutations.startGame, { ...host, quizId })).rejects.toThrow(
      "2 frågor behöver fyllas i innan quizet startar.",
    );
  });

  it("refuses a wrong passphrase", async () => {
    const { t, quizId } = await setupQuiz();
    await expect(t.mutation(api.games.mutations.startGame, { hostPassphrase: "fel", quizId })).rejects.toThrow("Fel lösenord.");
  });
});

describe("endGame", () => {
  it("ends the game and keeps the time it first ended", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await t.mutation(api.games.mutations.endGame, { ...host, gameId });
    const endedAt = (await t.run((ctx) => ctx.db.get("games", gameId)))?.endedAt;
    await t.mutation(api.games.mutations.endGame, { ...host, gameId });

    await expect(t.query(api.games.queries.getRunningGame, {})).resolves.toBeNull();
    expect((await t.run((ctx) => ctx.db.get("games", gameId)))?.endedAt).toBe(endedAt);
  });
});

describe("goToNextScreen and goToPreviousScreen", () => {
  type TestConvex = Awaited<ReturnType<typeof setupQuiz>>["t"];
  const screenNow = async (t: TestConvex) => (await t.query(api.games.queries.getRunningGame, {}))!.screen;
  // Steps from the screen showing now, as the admin view will.
  const next = async (t: TestConvex, gameId: Id<"games">) =>
    t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: await screenNow(t) });
  const previous = async (t: TestConvex, gameId: Id<"games">) =>
    t.mutation(api.games.mutations.goToPreviousScreen, { ...host, gameId, from: await screenNow(t) });

  it("step through the screens and stay put at the ends", async () => {
    const { t, quizId, roundId, questionId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });

    await previous(t, gameId);
    expect(await screenNow(t)).toEqual({ kind: "lobby" });
    for (const expected of [{ kind: "rules" }, { kind: "roundIntro", roundId }, { kind: "question", questionId }]) {
      await next(t, gameId);
      expect(await screenNow(t)).toEqual(expected);
    }
    await next(t, gameId);
    await next(t, gameId);
    expect(await screenNow(t)).toEqual({ kind: "finalLeaderboard" });
    await previous(t, gameId);
    expect(await screenNow(t)).toEqual({ kind: "question", questionId });
  });

  it("move only once when two presses start from the same screen", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "lobby" } });
    await t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "lobby" } });
    expect(await screenNow(t)).toEqual({ kind: "rules" });
  });

  it("move on from the screen that took the place of a question deleted during the game", async () => {
    const { t, quizId, roundId, questionId } = await setupQuiz();
    const second = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId, type: "activity" });
    await t.mutation(api.questions.mutations.updateQuestion, { ...host, questionId: second, prompt: "Julsång" });
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    for (let i = 0; i < 3; i++) await next(t, gameId);

    await t.mutation(api.questions.mutations.deleteQuestion, { ...host, questionId });
    expect(await screenNow(t)).toEqual({ kind: "question", questionId: second });
    await next(t, gameId);
    expect(await screenNow(t)).toEqual({ kind: "finalLeaderboard" });
  });

  it("refuse a game that has ended", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await t.mutation(api.games.mutations.endGame, { ...host, gameId });
    await expect(t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "lobby" } })).rejects.toThrow(
      "Quizet är slut.",
    );
  });

  it("refuse a wrong passphrase", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await expect(
      t.mutation(api.games.mutations.goToPreviousScreen, { hostPassphrase: "fel", gameId, from: { kind: "lobby" } }),
    ).rejects.toThrow("Fel lösenord.");
  });
});

describe("the question timer", () => {
  const running = { kind: "running" as const, endsAt: 130_000 };
  type TestConvex = Awaited<ReturnType<typeof setupQuiz>>["t"];
  const runningGame = async (t: TestConvex) => (await t.query(api.games.queries.getRunningGame, {}))!;
  // The timer showing now, which the admin view sends with each press.
  const timerNow = async (t: TestConvex) => (await runningGame(t)).timer!;
  const step = async (t: TestConvex, gameId: Id<"games">, direction: "next" | "previous") => {
    const mutation = direction === "next" ? api.games.mutations.goToNextScreen : api.games.mutations.goToPreviousScreen;
    await t.mutation(mutation, { ...host, gameId, from: (await runningGame(t)).screen });
  };

  // A game showing a question with a 30 second limit, started at 100 seconds.
  async function atTimedQuestion() {
    const { t, quizId, questionId } = await setupQuiz();
    await t.mutation(api.questions.mutations.updateQuestion, { ...host, questionId, timeLimitSeconds: 30 });
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await step(t, gameId, "next");
    await step(t, gameId, "next");
    vi.setSystemTime(100_000);
    await step(t, gameId, "next");
    return { t, gameId };
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts when a question with a time limit shows", async () => {
    const { t } = await atTimedQuestion();
    expect((await runningGame(t)).timer).toEqual({ kind: "running", endsAt: 130_000 });
  });

  it("is gone on the next screen and starts over when stepping back to the question", async () => {
    const { t, gameId } = await atTimedQuestion();
    await step(t, gameId, "next");
    expect((await runningGame(t)).timer).toBeNull();
    vi.setSystemTime(200_000);
    await step(t, gameId, "previous");
    expect((await runningGame(t)).timer).toEqual({ kind: "running", endsAt: 230_000 });
  });

  it("doesn't start for a question without a time limit", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    for (let i = 0; i < 3; i++) await step(t, gameId, "next");
    expect((await runningGame(t)).view.kind).toBe("question");
    expect((await runningGame(t)).timer).toBeNull();
  });

  it("pauses, resumes with the time that was left, and gets 15 seconds more", async () => {
    const { t, gameId } = await atTimedQuestion();
    vi.setSystemTime(110_000);
    await t.mutation(api.games.mutations.pauseGameTimer, { ...host, gameId, from: await timerNow(t) });
    expect((await runningGame(t)).timer).toEqual({ kind: "paused", remainingMs: 20_000 });
    vi.setSystemTime(500_000);
    await t.mutation(api.games.mutations.resumeGameTimer, { ...host, gameId, from: await timerNow(t) });
    expect((await runningGame(t)).timer).toEqual({ kind: "running", endsAt: 520_000 });
    await t.mutation(api.games.mutations.extendGameTimer, { ...host, gameId, from: await timerNow(t) });
    expect((await runningGame(t)).timer).toEqual({ kind: "running", endsAt: 535_000 });
  });

  it("counts two presses from the same timer once", async () => {
    const { t, gameId } = await atTimedQuestion();
    const from = await timerNow(t);
    await t.mutation(api.games.mutations.extendGameTimer, { ...host, gameId, from });
    await t.mutation(api.games.mutations.extendGameTimer, { ...host, gameId, from });
    expect((await runningGame(t)).timer).toEqual({ kind: "running", endsAt: 145_000 });
  });

  it("leaves the question's new timer alone when a press comes after a step", async () => {
    const { t, gameId } = await atTimedQuestion();
    const from = await timerNow(t);
    await step(t, gameId, "next");
    vi.setSystemTime(200_000);
    await step(t, gameId, "previous");
    await t.mutation(api.games.mutations.pauseGameTimer, { ...host, gameId, from });
    expect((await runningGame(t)).timer).toEqual({ kind: "running", endsAt: 230_000 });
  });

  it("does nothing on a screen without a timer", async () => {
    const { t, quizId } = await setupQuiz();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    await t.mutation(api.games.mutations.extendGameTimer, { ...host, gameId, from: running });
    expect((await runningGame(t)).timer).toBeNull();
  });

  it("refuses a game that has ended", async () => {
    const { t, gameId } = await atTimedQuestion();
    await t.mutation(api.games.mutations.endGame, { ...host, gameId });
    await expect(t.mutation(api.games.mutations.pauseGameTimer, { ...host, gameId, from: running })).rejects.toThrow("Quizet är slut.");
  });

  it("refuses a wrong passphrase", async () => {
    const { t, gameId } = await atTimedQuestion();
    await expect(t.mutation(api.games.mutations.resumeGameTimer, { hostPassphrase: "fel", gameId, from: running })).rejects.toThrow("Fel lösenord.");
  });
});

describe("the question's clip", () => {
  type TestConvex = Awaited<ReturnType<typeof setupQuiz>>["t"];
  const runningGame = async (t: TestConvex) => (await t.query(api.games.queries.getRunningGame, {}))!;
  const playbackNow = async (t: TestConvex) => (await runningGame(t)).playback!;
  const step = async (t: TestConvex, gameId: Id<"games">, direction: "next" | "previous") => {
    const mutation = direction === "next" ? api.games.mutations.goToNextScreen : api.games.mutations.goToPreviousScreen;
    await t.mutation(mutation, { ...host, gameId, from: (await runningGame(t)).screen });
  };

  // A game showing a question with a sound clip.
  async function atQuestionWithSound() {
    const { t, quizId, questionId } = await setupQuiz();
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["ljud"])));
    await t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId, media: { kind: "audio", storageId } });
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    for (let i = 0; i < 3; i++) await step(t, gameId, "next");
    return { t, gameId };
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits at the start when its question shows", async () => {
    const { t } = await atQuestionWithSound();
    expect((await runningGame(t)).playback).toEqual({ kind: "paused", positionMs: 0 });
  });

  it("plays and pauses where it got to", async () => {
    const { t, gameId } = await atQuestionWithSound();
    await t.mutation(api.games.mutations.playMedia, { ...host, gameId, from: await playbackNow(t) });
    expect((await runningGame(t)).playback).toEqual({ kind: "playing", startedAt: 100_000 });
    vi.setSystemTime(104_000);
    await t.mutation(api.games.mutations.pauseMedia, { ...host, gameId, from: await playbackNow(t) });
    expect((await runningGame(t)).playback).toEqual({ kind: "paused", positionMs: 4_000 });
  });

  it("counts two presses from the same playback once", async () => {
    const { t, gameId } = await atQuestionWithSound();
    const from = await playbackNow(t);
    await t.mutation(api.games.mutations.playMedia, { ...host, gameId, from });
    vi.setSystemTime(104_000);
    await t.mutation(api.games.mutations.playMedia, { ...host, gameId, from });
    expect((await runningGame(t)).playback).toEqual({ kind: "playing", startedAt: 100_000 });
  });

  it("stops on the next screen and starts over when stepping back", async () => {
    const { t, gameId } = await atQuestionWithSound();
    await t.mutation(api.games.mutations.playMedia, { ...host, gameId, from: await playbackNow(t) });
    await step(t, gameId, "next");
    expect((await runningGame(t)).playback).toBeNull();
    await step(t, gameId, "previous");
    expect((await runningGame(t)).playback).toEqual({ kind: "paused", positionMs: 0 });
  });

  it("refuses a game that has ended", async () => {
    const { t, gameId } = await atQuestionWithSound();
    await t.mutation(api.games.mutations.endGame, { ...host, gameId });
    await expect(
      t.mutation(api.games.mutations.playMedia, { ...host, gameId, from: { kind: "paused", positionMs: 0 } }),
    ).rejects.toThrow("Quizet är slut.");
  });

  it("refuses a wrong passphrase", async () => {
    const { t, gameId } = await atQuestionWithSound();
    await expect(
      t.mutation(api.games.mutations.pauseMedia, { hostPassphrase: "fel", gameId, from: { kind: "paused", positionMs: 0 } }),
    ).rejects.toThrow("Fel lösenord.");
  });
});
