import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { aiJudgingOf } from "../aiJudge/judging";
import { host, setupConvexTest } from "../test.setup";

// A running game showing a free-text question the AI judges, with two teams.
async function atQuestion() {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Julmat", kind: "questions" });
    const content = { type: "freeText" as const, fields: [{ label: "", acceptedAnswers: ["Saffran"] }], pointsPerField: 1, fuzzy: true };
    const questionId = await ctx.db.insert("questions", { quizId, roundId, position: 0, prompt: "Vilken krydda?", timeLimitSeconds: null, media: null, hostNotes: "", content });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3 });
    const red = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
    const blue = await ctx.db.insert("teams", { gameId, name: "Blå", colour: "blue" });
    return { gameId, questionId, red, blue };
  });
  return { t, ...ids };
}

describe("the judging flow", () => {
  // Keeps convex-test from running the queued AI judge on its own.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts the AI judge once every team has sent, and Nästa waits until every text is judged", async () => {
    const { t, gameId, questionId, red, blue } = await atQuestion();
    const send = (teamId: typeof red, text: string) =>
      t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: { type: "freeText", fields: [text] } });
    const judging = () => t.run((ctx) => aiJudgingOf(ctx, { gameId, questionId }));
    const next = () => t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "question", questionId } });

    await send(red, "Safran");
    expect(await judging()).toBeNull();
    await send(blue, "Saffran");
    expect((await judging())?.status).toBe("judging");

    await expect(next()).rejects.toThrow("Alla svar behöver bedömas");
    await t.mutation(api.verdicts.mutations.judgeText, { ...host, gameId, questionId, slot: 0, text: "Safran", target: 0 });
    await next();
    expect((await t.run((ctx) => ctx.db.get("games", gameId)))?.screen).toEqual({ kind: "answer", questionId });
  });

  it("lets Nästa close an open question, and then waits on its answer screen", async () => {
    const { t, gameId, questionId, red } = await atQuestion();
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId: red, questionId, content: { type: "freeText", fields: ["Safran"] } });
    await t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "question", questionId } });
    await expect(
      t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "answer", questionId } }),
    ).rejects.toThrow("Alla svar behöver bedömas");
    await expect(
      t.mutation(api.games.mutations.goToPreviousScreen, { ...host, gameId, from: { kind: "answer", questionId } }),
    ).resolves.toBeNull();
  });

  it("takes no more answers once every team has sent, from a team that joins late either", async () => {
    const { t, gameId, questionId, red, blue } = await atQuestion();
    const send = (teamId: typeof red, text: string) =>
      t.mutation(api.answers.mutations.sendAnswer, { teamId, questionId, content: { type: "freeText", fields: [text] } });
    await send(red, "Saffran");
    await send(blue, "Saffran");
    const late = await t.run((ctx) => ctx.db.insert("teams", { gameId, name: "Gröna", colour: "green" }));
    await expect(send(late, "Safran")).rejects.toThrow("tar inte emot svar");
    expect((await t.query(api.games.queries.getRunningGame, {}))?.isQuestionClosed).toBe(true);
  });
});

