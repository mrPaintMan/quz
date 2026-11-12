import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host } from "../test.setup";
import { atActivity } from "./manualPoints.setup";

const scoresOf = async (setup: Awaited<ReturnType<typeof atActivity>>) =>
  (await setup.t.query(api.scores.queries.getScores, { gameId: setup.gameId })).map(({ name, points }) => `${name} ${points}`);

describe("setActivityPoints", () => {
  it("sets a team's points for the activity, replaces them when set again, and clears them", async () => {
    const setup = await atActivity();
    const { t, gameId, questionId, red } = setup;
    const set = (points: number | null) => t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: red, points });
    await set(3);
    await set(4.5);
    expect(await scoresOf(setup)).toEqual(["Röda 4.5", "Blå 0"]);
    await set(null);
    expect(await scoresOf(setup)).toEqual(["Röda 0", "Blå 0"]);
    expect(await t.run((ctx) => ctx.db.query("adjustments").collect())).toEqual([]);
  });

  it("refuses points past the activity's most, a question that isn't an activity, or a team from another game", async () => {
    const { t, gameId, questionId, roundId, quizId, red } = await atActivity();
    await expect(t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: red, points: 6 })).rejects.toThrow("mellan 0 och 5");
    const other = await t.run(async (ctx) => {
      const question = await ctx.db.insert("questions", { quizId, roundId, position: 1, prompt: "Hur många?", timeLimitSeconds: null, media: null, hostNotes: "", content: { type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } } });
      const otherGame = await ctx.db.insert("games", { quizId, endedAt: 1, screen: { kind: "lobby" }, screenIndex: 0 });
      return { question, stranger: await ctx.db.insert("teams", { gameId: otherGame, name: "Gröna", colour: "green" }) };
    });
    await expect(t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId: other.question, teamId: red, points: 1 })).rejects.toThrow("ingen aktivitet");
    await expect(t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: other.stranger, points: 1 })).rejects.toThrow("inte med");
  });

  it("is for the hosts only", async () => {
    const { t, gameId, questionId, red } = await atActivity();
    await expect(t.mutation(api.adjustments.mutations.setActivityPoints, { hostPassphrase: "fel", gameId, questionId, teamId: red, points: 1 })).rejects.toThrow();
  });
});

describe("addCorrection and removeCorrection", () => {
  it("adds or takes away a team's points, and takes a correction back", async () => {
    const setup = await atActivity();
    const { t, gameId, red, blue } = setup;
    await t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: red, points: 2 });
    await t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: blue, points: -1.5 });
    expect(await scoresOf(setup)).toEqual(["Röda 2", "Blå -1.5"]);
    const [latest] = await t.query(api.adjustments.queries.listCorrections, { ...host, gameId });
    await t.mutation(api.adjustments.mutations.removeCorrection, { ...host, gameId, adjustmentId: latest._id });
    expect(await scoresOf(setup)).toEqual(["Röda 2", "Blå 0"]);
  });

  it("refuses a correction of nothing", async () => {
    const { t, gameId, red } = await atActivity();
    await expect(t.mutation(api.adjustments.mutations.addCorrection, { ...host, gameId, teamId: red, points: 0 })).rejects.toThrow("läggas till eller dras av");
  });

  it("leaves an activity's points alone when asked to take them back as a correction", async () => {
    const { t, gameId, questionId, red } = await atActivity();
    await t.mutation(api.adjustments.mutations.setActivityPoints, { ...host, gameId, questionId, teamId: red, points: 3 });
    const [activity] = await t.run((ctx) => ctx.db.query("adjustments").collect());
    await t.mutation(api.adjustments.mutations.removeCorrection, { ...host, gameId, adjustmentId: activity._id });
    expect(await t.run((ctx) => ctx.db.query("adjustments").collect())).toHaveLength(1);
  });
});
