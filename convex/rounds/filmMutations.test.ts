import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

async function setupPaSparet() {
  const t = setupConvexTest();
  const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
  const roundId = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "paSparet", title: "På spåret" });
  const tree = async () => (await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId }))!.rounds[0];
  const order = async () => (await tree()).questions.map((question) => [question.content.type, question.filmId ?? "trip"]);
  return { t, quizId, roundId, tree, order };
}

const video = { kind: "video" as const, r2Key: "film-key", posterId: null, durationSeconds: 60 };

describe("addFilm", () => {
  it("adds a film without video, with its first question, after the trip", async () => {
    const { t, roundId, tree, order } = await setupPaSparet();
    const { filmId, questionId } = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "freeText" });
    expect((await tree()).films).toEqual([{ id: filmId, video: null }]);
    expect(await order()).toEqual([["paSparet", "trip"], ["freeText", filmId]]);
    expect((await tree()).questions[1]._id).toBe(questionId);
  });

  it("refuses films in a question round", async () => {
    const { t, quizId } = await setupPaSparet();
    const julmat = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmat" });
    await expect(t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId: julmat, type: "freeText" })).rejects.toThrow(
      "hör till På spåret",
    );
  });

  it("refuses a type that can't follow a film", async () => {
    const { t, roundId } = await setupPaSparet();
    await expect(t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "activity" })).rejects.toThrow(
      "kan inte ställas efter en film",
    );
  });
});

describe("addFilmQuestion", () => {
  it("adds a question at the end of its film, before the next film's questions", async () => {
    const { t, roundId, order } = await setupPaSparet();
    const first = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "freeText" });
    const second = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "number" });
    await t.mutation(api.rounds.filmMutations.addFilmQuestion, { ...host, roundId, filmId: first.filmId, type: "multipleChoice" });
    expect(await order()).toEqual([
      ["paSparet", "trip"],
      ["freeText", first.filmId],
      ["multipleChoice", first.filmId],
      ["number", second.filmId],
    ]);
  });

  it("refuses a fourth question after the films", async () => {
    const { t, roundId } = await setupPaSparet();
    const { filmId } = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "freeText" });
    await t.mutation(api.rounds.filmMutations.addFilmQuestion, { ...host, roundId, filmId, type: "freeText" });
    await t.mutation(api.rounds.filmMutations.addFilmQuestion, { ...host, roundId, filmId, type: "freeText" });
    await expect(t.mutation(api.rounds.filmMutations.addFilmQuestion, { ...host, roundId, filmId, type: "freeText" })).rejects.toThrow(
      "högst 3 frågor",
    );
    await expect(t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "freeText" })).rejects.toThrow("högst 3 frågor");
  });

  it("refuses a film that is gone", async () => {
    const { t, roundId } = await setupPaSparet();
    await expect(
      t.mutation(api.rounds.filmMutations.addFilmQuestion, { ...host, roundId, filmId: "gone", type: "freeText" }),
    ).rejects.toThrow("finns inte längre");
  });
});

describe("setFilmVideo", () => {
  it("saves and removes a film's video", async () => {
    const { t, roundId, tree } = await setupPaSparet();
    const { filmId } = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "freeText" });
    await t.mutation(api.rounds.filmMutations.setFilmVideo, { ...host, roundId, filmId, video });
    expect((await tree()).films).toEqual([{ id: filmId, video }]);
    await t.mutation(api.rounds.filmMutations.setFilmVideo, { ...host, roundId, filmId, video: null });
    expect((await tree()).films).toEqual([{ id: filmId, video: null }]);
  });
});

describe("deleteFilm", () => {
  it("deletes the film with its questions and closes the gap", async () => {
    const { t, roundId, tree, order } = await setupPaSparet();
    const first = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "freeText" });
    const second = await t.mutation(api.rounds.filmMutations.addFilm, { ...host, roundId, type: "number" });
    await t.mutation(api.rounds.filmMutations.deleteFilm, { ...host, roundId, filmId: first.filmId });
    expect((await tree()).films?.map((film) => film.id)).toEqual([second.filmId]);
    expect(await order()).toEqual([["paSparet", "trip"], ["number", second.filmId]]);
    expect((await tree()).questions.map((question) => question.position)).toEqual([0, 1]);
  });
});
