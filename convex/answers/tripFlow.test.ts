import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";

// A running game on a trip with a 100-second film, playing from 0 at time 0, with two teams.
async function atTrip() {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "På spåret", kind: "paSparet" });
    const questionId = await ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "Vart är vi på väg?",
      timeLimitSeconds: null,
      media: { kind: "video", r2Key: "film", posterId: null, durationSeconds: 100 },
      hostNotes: "",
      content: { type: "paSparet", acceptedAnswers: ["Kiruna"], fuzzy: false, clues: ["a", "b", "c", "d", "e"] },
    });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3, playback: { kind: "playing", startedAt: 0 } });
    const red = await ctx.db.insert("teams", { gameId, name: "Röda", colour: "red" });
    const blue = await ctx.db.insert("teams", { gameId, name: "Blå", colour: "blue" });
    return { gameId, questionId, red, blue };
  });
  return { t, ...ids };
}

describe("the trip's emergency brake", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("locks a guess at the clue showing, scores it once the trip closes, and shows it on the TV", async () => {
    const { t, gameId, questionId, red, blue } = await atTrip();
    const guess = (text: string) => ({ type: "paSparet" as const, guess: text, brakeClueIndex: 4 });
    vi.setSystemTime(25_000);
    await t.mutation(api.answers.mutations.sendAnswer, { teamId: red, questionId, content: guess("Kiruna") });
    await t.mutation(api.answers.mutations.saveAnswerDraft, { teamId: blue, questionId, content: guess("Kiruna") });
    expect(await t.query(api.answers.queries.getTeamAnswer, { teamId: red, questionId })).toEqual({ content: { ...guess("Kiruna"), brakeClueIndex: 1 }, isLocked: true });
    expect(await t.query(api.answers.queries.getTeamAnswer, { teamId: blue, questionId })).toEqual({ content: { ...guess("Kiruna"), brakeClueIndex: null }, isLocked: false });

    await t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "question", questionId } });
    const scores = await t.query(api.scores.queries.getScores, { gameId });
    expect(scores.map(({ name, points }) => `${name} ${points}`)).toEqual(["Röda 8", "Blå 0"]);
    const game = await t.query(api.games.queries.getRunningGame, {});
    expect(game?.view).toMatchObject({
      kind: "answer",
      revealed: { type: "paSparet", destination: "Kiruna", guesses: [{ name: "Röda", brakePoints: 8, points: 8 }, { name: "Blå", brakePoints: null, points: 0 }] },
    });
  });
});
