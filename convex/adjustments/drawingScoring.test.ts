import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import { host } from "../test.setup";
import { atDrawing, redDrawing } from "./handPoints.setup";

describe("scoring drawings by hand", () => {
  it("makes Nästa wait on the drawing's answer screen until every drawing sent has points", async () => {
    const { t, gameId, drawingId, red } = await atDrawing();
    const next = () => t.mutation(api.games.mutations.goToNextScreen, { ...host, gameId, from: { kind: "answer", questionId: drawingId } });
    await expect(next()).rejects.toThrow("Alla svar behöver poäng");
    await t.mutation(api.adjustments.mutations.setHandPoints, { ...host, gameId, questionId: drawingId, teamId: red, points: 0 });
    await next();
    expect((await t.run((ctx) => ctx.db.get("games", gameId)))?.screen.kind).not.toBe("answer");
  });

  it("shows the team its drawing waiting for points, then with the points the hosts gave", async () => {
    const { t, gameId, drawingId, red, blue } = await atDrawing();
    const feedback = (teamId: typeof red) => t.query(api.answers.queries.getTeamFeedback, { teamId });
    expect(await feedback(red)).toMatchObject({ answer: redDrawing, outcome: { points: 0, parts: [{ result: "pending" }] } });
    await t.mutation(api.adjustments.mutations.setHandPoints, { ...host, gameId, questionId: drawingId, teamId: red, points: 2 });
    expect(await feedback(red)).toMatchObject({ outcome: { points: 2, parts: [{ result: "right", points: 2 }] } });
    expect(await feedback(blue)).toMatchObject({ answer: null, outcome: null });
  });

  it("counts a drawing's points once in the scores, from the hosts alone", async () => {
    const { t, gameId, drawingId, red } = await atDrawing();
    await t.mutation(api.adjustments.mutations.setHandPoints, { ...host, gameId, questionId: drawingId, teamId: red, points: 3 });
    const scores = await t.query(api.scores.queries.getScores, { gameId });
    expect(scores.map(({ name, points }) => `${name} ${points}`)).toEqual(["Röda 3", "Blå 0"]);
  });

  it("shows every team's drawing on the TV's answer screen", async () => {
    const { t } = await atDrawing();
    const game = await t.query(api.games.queries.getRunningGame, {});
    expect(game?.view).toMatchObject({ kind: "answer", revealed: { type: "drawing", drawings: [{ name: "Röda", colour: "red", strokes: redDrawing.strokes }] } });
  });
});

describe("a paper cleared before the time ran out", () => {
  it("counts as no answer on the phone", async () => {
    const { t, gameId, drawingId, blue } = await atDrawing();
    await t.run((ctx) => ctx.db.insert("answers", { gameId, teamId: blue, questionId: drawingId, content: { type: "drawing", strokes: [] }, lockedAt: 2 }));
    expect(await t.query(api.answers.queries.getTeamFeedback, { teamId: blue })).toMatchObject({ outcome: null });
  });
});
