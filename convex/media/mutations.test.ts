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

describe("setQuestionMedia", () => {
  it("attaches an uploaded file to the question", async () => {
    const { t, questionId, storageId, mediaOf } = await setupQuestionWithFile();
    await t.mutation(api.media.mutations.setQuestionMedia, { ...host, questionId, media: { kind: "image", storageId } });
    expect(await mediaOf()).toEqual({ kind: "image", storageId });
  });

  it("saves a film with its still and length", async () => {
    const { t, questionId, storageId, mediaOf } = await setupQuestionWithFile();
    const media = { kind: "video" as const, storageId, posterId: null, durationSeconds: 120 };
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
