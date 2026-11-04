import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { setupConvexTest } from "../test.setup";

// A game with two teams and a question; Röda has sent its answer and Blå has a draft.
async function withAnswers() {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
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
    const red = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
    const blue = await ctx.db.insert("teams", { gameId, name: "Blå", colour: "blue" });
    const content = { type: "multipleChoice" as const, optionIndex: 0 };
    await ctx.db.insert("answers", { gameId, teamId: red, questionId, content, lockedAt: 5 });
    await ctx.db.insert("answers", { gameId, teamId: blue, questionId, content, lockedAt: null });
    return { gameId, questionId, red, blue };
  });
  return { t, ...ids };
}

describe("getTeamAnswer", () => {
  it("gives the team its own answer and whether it is locked", async () => {
    const { t, questionId, red, blue } = await withAnswers();
    const content = { type: "multipleChoice", optionIndex: 0 };
    await expect(t.query(api.answers.queries.getTeamAnswer, { teamId: red, questionId })).resolves.toEqual({ content, isLocked: true });
    await expect(t.query(api.answers.queries.getTeamAnswer, { teamId: blue, questionId })).resolves.toEqual({ content, isLocked: false });
  });

  it("is null before the team has answered", async () => {
    const { t, questionId, red } = await withAnswers();
    await t.run(async (ctx) => {
      for (const answer of await ctx.db.query("answers").collect()) await ctx.db.delete("answers", answer._id);
    });
    await expect(t.query(api.answers.queries.getTeamAnswer, { teamId: red, questionId })).resolves.toBeNull();
  });
});

describe("getAnsweredTeamIds", () => {
  it("names the teams whose answer is locked, not those with a draft", async () => {
    const { t, gameId, questionId, red } = await withAnswers();
    await expect(t.query(api.answers.queries.getAnsweredTeamIds, { gameId, questionId })).resolves.toEqual([red]);
  });
});
