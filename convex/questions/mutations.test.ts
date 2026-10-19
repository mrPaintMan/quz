import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { host, setupConvexTest } from "../test.setup";

async function setupQuiz() {
  const t = setupConvexTest();
  const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
  const julmat = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmat" });
  const julfilmer = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julfilmer" });
  const paSparet = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "paSparet", title: "På spåret" });
  const addActivity = async (roundId: Id<"rounds">, prompt: string) => {
    const questionId = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId, type: "activity" });
    await t.mutation(api.questions.mutations.updateQuestion, { ...host, questionId, prompt });
    return questionId;
  };
  const promptsIn = async (roundId: Id<"rounds">) => {
    const tree = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    return tree?.rounds.find((round) => round._id === roundId)?.questions.map((question) => question.prompt);
  };
  const getQuestion = (questionId: Id<"questions">) => t.run((ctx) => ctx.db.get("questions", questionId));
  return { t, quizId, julmat, julfilmer, paSparet, addActivity, promptsIn, getQuestion };
}

describe("addQuestion", () => {
  it("adds an empty draft of the chosen type at the end of the round", async () => {
    const { t, julmat, addActivity, getQuestion } = await setupQuiz();
    await addActivity(julmat, "Pepparkakshus");
    const mapId = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: julmat, type: "mapPin" });
    expect(await getQuestion(mapId)).toMatchObject({
      position: 1,
      prompt: "",
      timeLimitSeconds: null,
      media: null,
      content: { type: "mapPin", target: null },
    });
  });

  it("refuses a second trip in a På spåret round", async () => {
    const { t, paSparet } = await setupQuiz();
    await expect(
      t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: paSparet, type: "paSparet" }),
    ).rejects.toThrow("exakt en resa");
  });

  it("refuses a type that doesn't belong in the round", async () => {
    const { t, paSparet } = await setupQuiz();
    await expect(
      t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: paSparet, type: "freeText" }),
    ).rejects.toThrow("passar inte i den här omgången");
  });

  it("refuses more than 100 questions in a round", async () => {
    const { t, quizId, julmat } = await setupQuiz();
    await t.run(async (ctx) => {
      for (let position = 0; position < 100; position++) {
        await ctx.db.insert("questions", {
          quizId,
          roundId: julmat,
          position,
          prompt: "",
          timeLimitSeconds: null,
          media: null,
          hostNotes: "",
          content: { type: "activity", maxPoints: 1 },
        });
      }
    });
    await expect(
      t.mutation(api.questions.mutations.addQuestion, { ...host, roundId: julmat, type: "activity" }),
    ).rejects.toThrow("högst 100 frågor");
  });
});

describe("updateQuestion", () => {
  it("changes only the given fields", async () => {
    const { t, julmat, addActivity, getQuestion } = await setupQuiz();
    const questionId = await addActivity(julmat, "Pepparkakshus");
    await t.mutation(api.questions.mutations.updateQuestion, {
      ...host,
      questionId,
      hostNotes: "Bäst hus vinner",
      content: { type: "activity", maxPoints: 5 },
    });
    expect(await getQuestion(questionId)).toMatchObject({
      prompt: "Pepparkakshus",
      hostNotes: "Bäst hus vinner",
      content: { type: "activity", maxPoints: 5 },
    });
  });

  it("drops content of another type but still saves the other fields", async () => {
    const { t, julmat, addActivity, getQuestion } = await setupQuiz();
    const questionId = await addActivity(julmat, "Pepparkakshus");
    await t.mutation(api.questions.mutations.updateQuestion, {
      ...host,
      questionId,
      prompt: "Rita en tomte",
      content: { type: "drawing", maxPoints: 1 },
    });
    expect(await getQuestion(questionId)).toMatchObject({ prompt: "Rita en tomte", content: { type: "activity" } });
  });
});

describe("changeQuestionType", () => {
  it("replaces the content with an empty draft of the new type and keeps the prompt", async () => {
    const { t, julmat, addActivity, getQuestion } = await setupQuiz();
    const questionId = await addActivity(julmat, "Rita en tomte");
    await t.mutation(api.questions.mutations.changeQuestionType, { ...host, questionId, type: "drawing" });
    expect(await getQuestion(questionId)).toMatchObject({ prompt: "Rita en tomte", content: { type: "drawing" } });
  });

  it("refuses a type that doesn't belong in the round", async () => {
    const { t, julmat, addActivity } = await setupQuiz();
    const questionId = await addActivity(julmat, "Pepparkakshus");
    await expect(
      t.mutation(api.questions.mutations.changeQuestionType, { ...host, questionId, type: "paSparet" }),
    ).rejects.toThrow("passar inte i den här omgången");
  });
});

describe("moveQuestion", () => {
  it("reorders questions within a round", async () => {
    const { t, julmat, addActivity, promptsIn } = await setupQuiz();
    await addActivity(julmat, "A");
    await addActivity(julmat, "B");
    const c = await addActivity(julmat, "C");
    await t.mutation(api.questions.mutations.moveQuestion, { ...host, questionId: c, toRoundId: julmat, toIndex: 0 });
    expect(await promptsIn(julmat)).toEqual(["C", "A", "B"]);
  });

  it("moves a question to another round and closes the gap it leaves", async () => {
    const { t, julmat, julfilmer, addActivity, promptsIn } = await setupQuiz();
    const a = await addActivity(julmat, "A");
    await addActivity(julmat, "B");
    await addActivity(julfilmer, "X");
    await t.mutation(api.questions.mutations.moveQuestion, { ...host, questionId: a, toRoundId: julfilmer, toIndex: 0 });
    expect(await promptsIn(julmat)).toEqual(["B"]);
    expect(await promptsIn(julfilmer)).toEqual(["A", "X"]);
  });

  it("refuses moving into a round where the type doesn't belong", async () => {
    const { t, julmat, paSparet, addActivity } = await setupQuiz();
    const a = await addActivity(julmat, "A");
    await expect(
      t.mutation(api.questions.mutations.moveQuestion, { ...host, questionId: a, toRoundId: paSparet, toIndex: 0 }),
    ).rejects.toThrow("passar inte i den här omgången");
  });

  it("refuses moving into another quiz", async () => {
    const { t, julmat, addActivity } = await setupQuiz();
    const a = await addActivity(julmat, "A");
    const otherQuiz = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Annat", year: 2026 });
    const otherRound = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId: otherQuiz, kind: "questions", title: "R" });
    await expect(
      t.mutation(api.questions.mutations.moveQuestion, { ...host, questionId: a, toRoundId: otherRound, toIndex: 0 }),
    ).rejects.toThrow("samma quiz");
  });
});

describe("deleteQuestion", () => {
  it("deletes the question and closes the gap", async () => {
    const { t, julmat, addActivity, promptsIn, getQuestion } = await setupQuiz();
    const a = await addActivity(julmat, "A");
    const b = await addActivity(julmat, "B");
    await t.mutation(api.questions.mutations.deleteQuestion, { ...host, questionId: a });
    expect(await promptsIn(julmat)).toEqual(["B"]);
    expect((await getQuestion(b))?.position).toBe(0);
  });

  it("keeps a På spåret round's trip", async () => {
    const { t, quizId, paSparet } = await setupQuiz();
    const tree = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    const [trip] = tree?.rounds.find((round) => round._id === paSparet)?.questions ?? [];
    await expect(t.mutation(api.questions.mutations.deleteQuestion, { ...host, questionId: trip._id })).rejects.toThrow(
      "Ta bort omgången i stället",
    );
  });
});
