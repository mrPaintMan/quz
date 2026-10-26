import { describe, expect, it } from "vitest";
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
      quizTitle: "Julquiz 2026",
      screen: { kind: "lobby" },
      view: { kind: "lobby" },
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
