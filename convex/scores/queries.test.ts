import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { setupConvexTest } from "../test.setup";

const choice = (correctIndex: number) => ({
  type: "multipleChoice" as const,
  options: [
    { text: "Sverige", imageId: null },
    { text: "Norge", imageId: null },
  ],
  correctIndex,
  points: 2,
});
const pick = (optionIndex: number) => ({ type: "multipleChoice" as const, optionIndex });

// A game with three teams and two multiple choice questions, the first closed by Nästa.
async function withGame() {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Flerval", kind: "questions" });
    const question = { quizId, roundId, prompt: "Vilket land?", timeLimitSeconds: null, media: null, hostNotes: "" };
    const closed = await ctx.db.insert("questions", { ...question, position: 0, content: choice(1) });
    const open = await ctx.db.insert("questions", { ...question, position: 1, content: choice(0) });
    const gameId = await ctx.db.insert("games", {
      quizId,
      endedAt: null,
      screen: { kind: "question", questionId: open },
      screenIndex: 5,
      closedQuestionIds: [closed],
    });
    const [red, blue, green] = await Promise.all(
      (["red", "blue", "green"] as const).map((colour, index) => ctx.db.insert("teams", { gameId, name: `Lag ${index + 1}`, colour })),
    );
    return { gameId, closed, open, red, blue, green };
  });
  const answer = (teamId: Id<"teams">, questionId: Id<"questions">, optionIndex: number, lockedAt: number | null = 1) =>
    t.run((ctx) => ctx.db.insert("answers", { gameId: ids.gameId, teamId, questionId, content: pick(optionIndex), lockedAt }));
  const scores = async () =>
    (await t.query(api.scores.queries.getScores, { gameId: ids.gameId })).map(({ name, points, rank }) => `${rank} ${name} ${points}`);
  return { t, ...ids, answer, scores };
}

describe("getScores", () => {
  it("ranks the teams by the points of their answers to closed questions", async () => {
    const { answer, scores, closed, red, blue } = await withGame();
    await answer(red, closed, 0);
    await answer(blue, closed, 1);
    expect(await scores()).toEqual(["1 Lag 2 2", "2 Lag 1 0", "2 Lag 3 0"]);
  });

  it("doesn't count the open question, so no phone learns its answer early", async () => {
    const { answer, scores, open, red } = await withGame();
    await answer(red, open, 0);
    expect(await scores()).toEqual(["1 Lag 1 0", "1 Lag 2 0", "1 Lag 3 0"]);
  });

  it("adds the hosts' points, including points taken away", async () => {
    const { t, gameId, scores, red, green } = await withGame();
    await t.run(async (ctx) => {
      await ctx.db.insert("adjustments", { gameId, teamId: green, questionId: null, points: 5, note: "Bonus" });
      await ctx.db.insert("adjustments", { gameId, teamId: red, questionId: null, points: -1, note: "Fusk" });
    });
    expect(await scores()).toEqual(["1 Lag 3 5", "2 Lag 2 0", "3 Lag 1 -1"]);
  });

  it("skips a closed question deleted during the game", async () => {
    const { t, answer, scores, closed, blue } = await withGame();
    await answer(blue, closed, 1);
    await t.run((ctx) => ctx.db.delete("questions", closed));
    expect(await scores()).toEqual(["1 Lag 1 0", "1 Lag 2 0", "1 Lag 3 0"]);
  });

  it("counts only locked answers", async () => {
    const { answer, scores, closed, blue } = await withGame();
    await answer(blue, closed, 1, null);
    expect(await scores()).toEqual(["1 Lag 1 0", "1 Lag 2 0", "1 Lag 3 0"]);
  });

  it("is empty for a game that is gone", async () => {
    const { t, gameId } = await withGame();
    await t.run((ctx) => ctx.db.delete("games", gameId));
    await expect(t.query(api.scores.queries.getScores, { gameId })).resolves.toEqual([]);
  });
});
