import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

async function setupQuizWithQuestion() {
  const t = setupConvexTest();
  const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz 2026", year: 2026 });
  const roundId = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmat" });
  const questionId = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId, type: "activity" });
  await t.mutation(api.questions.mutations.updateQuestion, { ...host, questionId, prompt: "Pepparkakshus" });
  return { t, quizId, roundId, questionId };
}

describe("createQuiz", () => {
  it("creates an empty quiz", async () => {
    const t = setupConvexTest();
    const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz 2026", year: 2026 });
    const tree = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    expect(tree?.quiz).toMatchObject({ title: "Julquiz 2026", year: 2026 });
    expect(tree?.rounds).toEqual([]);
  });
});

describe("updateQuiz", () => {
  it("changes only the given fields", async () => {
    const t = setupConvexTest();
    const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
    await t.mutation(api.quizzes.mutations.updateQuiz, { ...host, quizId, year: 2027 });
    const tree = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    expect(tree?.quiz).toMatchObject({ title: "Julquiz", year: 2027 });
  });

  it("refuses a quiz that does not exist", async () => {
    const { t, quizId } = await setupQuizWithQuestion();
    await t.mutation(api.quizzes.mutations.deleteQuiz, { ...host, quizId });
    await expect(t.mutation(api.quizzes.mutations.updateQuiz, { ...host, quizId, title: "x" })).rejects.toThrow(
      "Hittades inte",
    );
  });
});

describe("copyQuiz", () => {
  it("copies all rounds and questions into a new quiz and leaves the original intact", async () => {
    const { t, quizId } = await setupQuizWithQuestion();
    const copyId = await t.mutation(api.quizzes.mutations.copyQuiz, { ...host, quizId, title: "Julquiz 2027", year: 2027 });

    const copy = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId: copyId });
    expect(copy?.quiz).toMatchObject({ title: "Julquiz 2027", year: 2027 });
    expect(copy?.rounds.map((round) => round.title)).toEqual(["Julmat"]);
    expect(copy?.rounds[0].questions[0]).toMatchObject({ prompt: "Pepparkakshus", quizId: copyId });

    const original = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    expect(original?.rounds[0].questions[0].quizId).toBe(quizId);
  });
});

describe("deleteQuiz", () => {
  it("deletes the quiz together with its rounds and questions", async () => {
    const { t, quizId, roundId, questionId } = await setupQuizWithQuestion();
    await t.mutation(api.quizzes.mutations.deleteQuiz, { ...host, quizId });
    const remaining = await t.run(async (ctx) => ({
      round: await ctx.db.get("rounds", roundId),
      question: await ctx.db.get("questions", questionId),
    }));
    expect(remaining).toEqual({ round: null, question: null });
  });

  it("deletes the quiz's games with their teams", async () => {
    const { t, quizId } = await setupQuizWithQuestion();
    const gameId = await t.mutation(api.games.mutations.startGame, { ...host, quizId });
    const teamId = await t.mutation(api.teams.mutations.joinGame, { gameId, name: "Tomtarna", colour: "red" });
    await t.mutation(api.quizzes.mutations.deleteQuiz, { ...host, quizId });
    const remaining = await t.run(async (ctx) => ({ game: await ctx.db.get("games", gameId), team: await ctx.db.get("teams", teamId) }));
    expect(remaining).toEqual({ game: null, team: null });
  });
});
