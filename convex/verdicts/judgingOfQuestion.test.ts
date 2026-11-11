import { describe, expect, it } from "vitest";
import { freeText, markJudging, setupJudging } from "../aiJudge/aiJudgeGame.setup";
import { judgingOfQuestion } from "./judgingOfQuestion";

async function judgingIn(setup: Awaited<ReturnType<typeof setupJudging>>) {
  const { t, gameId, questionId } = setup;
  // The review holds functions, which can't leave t.run.
  return t.run(async (ctx) => {
    const { review, ...judging } = await judgingOfQuestion(ctx, (await ctx.db.get("games", gameId))!, (await ctx.db.get("questions", questionId))!);
    return { ...judging, hasReview: review !== null };
  });
}

const reopen = (setup: Awaited<ReturnType<typeof setupJudging>>) =>
  setup.t.run((ctx) => ctx.db.patch("games", setup.gameId, { closedQuestionIds: [] }));

describe("judgingOfQuestion", () => {
  it("is open, with nothing to review, until the answers lock", async () => {
    const setup = await setupJudging();
    await reopen(setup);
    await expect(judgingIn(setup)).resolves.toMatchObject({ isLocked: false, items: [], phase: "open", canStepOn: true });
  });

  it("counts the answers locked before Nästa closes the question, as by time-out", async () => {
    const setup = await setupJudging();
    await reopen(setup);
    await setup.t.run((ctx) => ctx.db.patch("games", setup.gameId, { lockedQuestionIds: [setup.questionId] }));
    await markJudging(setup);
    const judging = await judgingIn(setup);
    expect(judging).toMatchObject({ isLocked: true, aiStatus: "judging", phase: "judging", canStepOn: false });
    expect(judging.items.map((item) => item.text)).toEqual(["kanel", "safran"]);
  });

  it("waits for the hosts while texts are left, and settles once every text is judged", async () => {
    const setup = await setupJudging();
    const { t, gameId, questionId } = setup;
    await t.run((ctx) => ctx.db.insert("aiJudgings", { gameId, questionId, status: "done" }));
    await t.run((ctx) => ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "safran", target: 0, byAi: true }));
    await expect(judgingIn(setup)).resolves.toMatchObject({ phase: "reviewing", canStepOn: false });
    await t.run((ctx) => ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "kanel", target: null }));
    await expect(judgingIn(setup)).resolves.toMatchObject({ phase: "settled", canStepOn: true });
  });

  it("waits for nothing when the AI switch is off", async () => {
    const setup = await setupJudging({ ...freeText, fuzzy: false });
    await expect(judgingIn(setup)).resolves.toMatchObject({ isLocked: true, phase: "settled", canStepOn: true });
  });
});
