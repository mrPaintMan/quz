import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

async function setupQuestionWithFile() {
  const t = setupConvexTest();
  const quizId = await t.mutation(api.quizzes.mutations.createQuiz, { ...host, title: "Julquiz", year: 2026 });
  const roundId = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "questions", title: "Julmusik" });
  const questionId = await t.mutation(api.questions.mutations.addQuestion, { ...host, roundId, type: "freeText" });
  const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["bild"])));
  const mediaOf = async () => (await t.run((ctx) => ctx.db.get("questions", questionId)))?.media;
  return { t, quizId, questionId, storageId, mediaOf };
}

describe("generateUploadUrl", () => {
  it("gives the editor a URL to upload a file to", async () => {
    const t = setupConvexTest();
    await expect(t.mutation(api.media.mutations.generateUploadUrl, host)).resolves.toEqual(expect.any(String));
  });
});

describe("generateFilmUploadUrl", () => {
  it("gives a signed R2 upload link and the key the film will have", async () => {
    const t = setupConvexTest();
    const { key, url } = await t.mutation(api.media.mutations.generateFilmUploadUrl, host);
    expect(url).toContain("quz-films-test");
    expect(url).toContain(key);
  });
});

describe("getFilmUrl", () => {
  it("gives a signed link to a film that lasts four hours", async () => {
    const t = setupConvexTest();
    const url = await t.mutation(api.media.mutations.getFilmUrl, { ...host, r2Key: "film-key" });
    expect(url).toContain("film-key");
    expect(new URL(url).searchParams.get("X-Amz-Expires")).toBe("14400");
  });
});

describe("getShowingFilmUrl", () => {
  const video = { kind: "video" as const, r2Key: "film-key", posterId: null, durationSeconds: 10 };

  async function gameShowing(screenKind: "question" | "answer") {
    const { t, quizId, questionId } = await setupQuestionWithFile();
    await t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId, media: video });
    await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: screenKind, questionId }, screenIndex: 3 }));
    return { t, questionId };
  }

  it("gives the TV a link to the film of the question showing now", async () => {
    const { t, questionId } = await gameShowing("question");
    await expect(t.mutation(api.media.mutations.getShowingFilmUrl, { questionId })).resolves.toContain("film-key");
  });

  it("gives nothing once the question no longer shows", async () => {
    const { t, questionId } = await gameShowing("answer");
    await expect(t.mutation(api.media.mutations.getShowingFilmUrl, { questionId })).resolves.toBeNull();
  });

  it("gives nothing for a question without a film", async () => {
    const { t, quizId, questionId } = await setupQuestionWithFile();
    await t.run((ctx) => ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 }));
    await expect(t.mutation(api.media.mutations.getShowingFilmUrl, { questionId })).resolves.toBeNull();
  });

  it("gives nothing when no game is running", async () => {
    const { t, questionId } = await setupQuestionWithFile();
    await expect(t.mutation(api.media.mutations.getShowingFilmUrl, { questionId })).resolves.toBeNull();
  });
});

describe("setQuestionMedia", () => {
  it("attaches an uploaded file to the question", async () => {
    const { t, questionId, storageId, mediaOf } = await setupQuestionWithFile();
    await t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId, media: { kind: "image", storageId } });
    expect(await mediaOf()).toEqual({ kind: "image", storageId });
  });

  it("saves a film with its still and length", async () => {
    const { t, questionId, storageId, mediaOf } = await setupQuestionWithFile();
    const media = { kind: "video" as const, r2Key: "film-key", posterId: storageId, durationSeconds: 120 };
    await t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId, media });
    expect(await mediaOf()).toEqual(media);
  });

  it("refuses anything but a film for a question that needs one", async () => {
    const { t, quizId, storageId } = await setupQuestionWithFile();
    const roundId = await t.mutation(api.rounds.mutations.addRound, { ...host, quizId, kind: "paSparet", title: "På spåret" });
    const tree = await t.query(api.quizzes.queries.getQuizTree, { ...host, quizId });
    const [trip] = tree?.rounds.find((round) => round._id === roundId)?.questions ?? [];
    await expect(
      t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId: trip._id, media: { kind: "image", storageId } }),
    ).rejects.toThrow("behöver en film");
  });
});

describe("removeQuestionMedia", () => {
  it("detaches the file from the question but keeps it in storage", async () => {
    const { t, questionId, storageId, mediaOf } = await setupQuestionWithFile();
    await t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId, media: { kind: "audio", storageId } });
    await t.mutation(api.media.mutations.removeQuestionMedia, { ...host, questionId });
    expect(await mediaOf()).toBeNull();
    expect(await t.run((ctx) => ctx.storage.getUrl(storageId))).not.toBeNull();
  });
});
