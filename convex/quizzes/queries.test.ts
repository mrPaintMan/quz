import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

describe("listQuizzes", () => {
  afterEach(() => vi.useRealTimers());

  it("lists quizzes with the most recently edited first", async () => {
    vi.useFakeTimers({ now: 1_000 });
    const t = setupConvexTest();
    const older = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz 2025", year: 2025 });
    vi.setSystemTime(2_000);
    await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz 2026", year: 2026 });
    vi.setSystemTime(3_000);
    await t.mutation(api.quizzes.mutations.updateQuiz, { ...host, quizId: older, title: "Julquiz 2025 (arkiv)" });

    const quizzes = await t.query(api.quizzes.queries.listQuizzes, host);
    expect(quizzes.map((quiz) => quiz.title)).toEqual(["Julquiz 2025 (arkiv)", "Julquiz 2026"]);
  });
});

describe("getQuizTree", () => {
  it("returns the quiz with its rounds and their questions in order", async () => {
    const t = setupConvexTest();
    const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
    const julmat = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmat" });
    await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "paSparet", title: "På spåret" });
    await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: julmat, type: "freeText" });
    await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: julmat, type: "activity" });

    const tree = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    expect(tree?.quiz.title).toBe("Julquiz");
    expect(tree?.rounds.map((round) => round.title)).toEqual(["Julmat", "På spåret"]);
    expect(tree?.rounds[0].questions.map((question) => question.content.type)).toEqual(["freeText", "activity"]);
    expect(tree?.rounds[1].questions).toEqual([]);
  });

  it("returns null for a quiz that no longer exists", async () => {
    const t = setupConvexTest();
    const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
    await t.mutation(api.quizzes.mutations.deleteQuiz, { ...host, quizId });
    await expect(t.query(api.quizzes.queries.getQuizTree, { ...host, quizId })).resolves.toBeNull();
  });
});
