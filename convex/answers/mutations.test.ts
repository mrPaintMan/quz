import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { host, setupConvexTest } from "../test.setup";
import type { Timer } from "../games/timer";

type TestConvex = ReturnType<typeof setupConvexTest>;

const guess = (value: number) => ({ type: "number" as const, value });

// A game showing a number question (lobby, rules, intro, question, answer, final), with a team.
async function atQuestion(timer?: Timer) {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Siffror", kind: "questions" });
    const questionId = await ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "Hur många renar har tomten?",
      timeLimitSeconds: 30,
      media: null,
      hostNotes: "",
      content: { type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3, 2, 1] } },
    });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3, timer });
    const teamId = await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" });
    return { roundId, questionId, gameId, teamId };
  });
  return { t, ...ids };
}

const answerOf = (t: TestConvex, teamId: Id<"teams">) => t.run(async (ctx) => (await ctx.db.query("answers").collect()).find((answer) => answer.teamId === teamId) ?? null);

const stepNext = (t: TestConvex, gameId: Id<"games">, questionId: Id<"questions">) =>
  t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "question", questionId } });

describe("saveAnswerDraft and sendAnswer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
  });

  afterEach(() => vi.useRealTimers());

  it("save a draft and then overwrite it as the team types", async () => {
    const { t, teamId, questionId, gameId } = await atQuestion();
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId, questionId, content: guess(7) });
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId, questionId, content: guess(8) });
    expect(await answerOf(t, teamId)).toMatchObject({ gameId, questionId, content: guess(8), lockedAt: null });
    expect(await t.run((ctx) => ctx.db.query("answers").collect())).toHaveLength(1);
  });

  it("lock the answer when it is sent, and refuse any change after that", async () => {
    const { t, teamId, questionId } = await atQuestion();
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId, questionId, content: guess(7) });
    await t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: guess(9) });
    expect(await answerOf(t, teamId)).toMatchObject({ content: guess(9), lockedAt: 100_000 });
    await expect(t.mutation(api.answers.mutations.saveAnswerDraft, { teamId, questionId, content: guess(1) })).rejects.toThrow(
      "Ert svar är låst.",
    );
  });

  it("refuse a question that isn't on the TV", async () => {
    const { t, teamId, questionId, gameId } = await atQuestion();
    await t.run((ctx) => ctx.db.patch("games", gameId, { screen: { kind: "answer", questionId }, screenIndex: 4 }));
    await expect(t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: guess(9) })).rejects.toThrow(
      "Frågan tar inte emot svar just nu.",
    );
  });

  it("refuse an answer of another type", async () => {
    const { t, teamId, questionId } = await atQuestion();
    await expect(
      t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: { type: "multipleChoice", optionIndex: 0 } }),
    ).rejects.toThrow("Svaret passar inte frågan.");
  });

  it("refuse a game that has ended", async () => {
    const { t, teamId, questionId, gameId } = await atQuestion();
    await t.run((ctx) => ctx.db.patch("games", gameId, { endedAt: 1 }));
    await expect(t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: guess(9) })).rejects.toThrow("Quizet är slut.");
  });

  it("accept answers for 2 seconds after the time is out, then refuse them", async () => {
    const { t, teamId, questionId } = await atQuestion({ kind: "running", endsAt: 130_000 });
    vi.setSystemTime(132_000);
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId, questionId, content: guess(8) });
    vi.setSystemTime(132_001);
    await expect(t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: guess(9) })).rejects.toThrow("Tiden är ute.");
  });
});

describe("closing a question", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
  });

  afterEach(() => vi.useRealTimers());

  it("locks the drafts when the hosts step on from the question", async () => {
    const { t, teamId, questionId, gameId } = await atQuestion();
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId, questionId, content: guess(7) });
    await stepNext(t, gameId, questionId);
    expect(await answerOf(t, teamId)).toMatchObject({ content: guess(7), lockedAt: 100_000 });
  });

  it("lets no one answer after the hosts step back to it", async () => {
    const { t, teamId, questionId, gameId } = await atQuestion();
    await stepNext(t, gameId, questionId);
    await t.mutation(api.games.mutations.goToPreviousScreen, { ...host, gameId, from: { kind: "answer", questionId } });
    await expect(t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: guess(9) })).rejects.toThrow(
      "Frågan tar inte emot svar just nu.",
    );
  });

  it("stays open when the hosts step back from it", async () => {
    const { t, teamId, questionId, gameId, roundId } = await atQuestion();
    await t.mutation(api.games.mutations.goToPreviousScreen, { ...host, gameId, from: { kind: "question", questionId } });
    await t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "roundIntro", roundId } });
    await t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: guess(9) });
    expect(await answerOf(t, teamId)).toMatchObject({ content: guess(9) });
  });
});

describe("sendAnswer for a type whose answering is built", () => {
  it("refuses an answer that isn't filled in", async () => {
    const t = setupConvexTest();
    const { teamId, questionId } = await t.run(async (ctx) => {
      const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
      const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Flerval", kind: "questions" });
      const questionId = await ctx.db.insert("questions", {
        quizId,
        roundId,
        position: 0,
        prompt: "Vilket land?",
        timeLimitSeconds: null,
        media: null,
        hostNotes: "",
        content: { type: "multipleChoice", options: [{ text: "Sverige", imageId: null }], correctIndex: 0, points: 1 },
      });
      const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
      return { questionId, teamId: await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" }) };
    });
    await expect(
      t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: { type: "multipleChoice", optionIndex: null } }),
    ).rejects.toThrow("Fyll i svaret innan ni skickar det.");
    await t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: { type: "multipleChoice", optionIndex: 0 } });
  });
});

