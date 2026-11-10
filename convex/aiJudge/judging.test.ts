import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { internal } from "../_generated/api";
import { aiJudgingOf, startAiJudging } from "./judging";
import { setupList } from "../verdicts/reviewGame.setup";
import { freeText, markJudging, setupJudging } from "./aiJudgeGame.setup";

describe("startAiJudging", () => {
  // Keeps convex-test from running the queued action on its own.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("marks the question as being judged and queues the AI judge", async () => {
    const { t, gameId, questionId } = await setupJudging();
    const result = await t.run(async (ctx) => {
      await startAiJudging(ctx, { gameId, questionId });
      return { judging: await aiJudgingOf(ctx, { gameId, questionId }), scheduled: await ctx.db.system.query("_scheduled_functions").collect() };
    });
    expect(result.judging?.status).toBe("judging");
    expect(result.scheduled.map((job) => job.name)).toEqual(["aiJudge/judge:judgeQuestion"]);
  });

  it("does nothing when the question's AI switch is off", async () => {
    const { t, gameId, questionId } = await setupJudging({ ...freeText, fuzzy: false });
    const judging = await t.run(async (ctx) => {
      await startAiJudging(ctx, { gameId, questionId });
      return aiJudgingOf(ctx, { gameId, questionId });
    });
    expect(judging).toBeNull();
  });
});

describe("prepareJudging", () => {
  it("asks about the sent texts no spelling matched and no one has judged", async () => {
    const { t, gameId, questionId } = await setupJudging();
    await t.run((ctx) => ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "kanel", target: null }));
    const job = await t.query(internal.aiJudge.judging.prepareJudging, { gameId, questionId });
    expect(job?.items).toEqual([{ slot: 0, text: "safran", written: "Safran", teamCount: 1 }]);
    expect(JSON.parse(job!.message).answers).toEqual([{ id: 0, field: 0, text: "Safran" }]);
  });

  it("tells the AI judge the names already given to list items outside the key", async () => {
    const { t, gameId, questionId } = await setupList();
    await t.run(async (ctx) => {
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "lund", target: "Lund" });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "lunds stad", target: "lund" });
    });
    const job = await t.query(internal.aiJudge.judging.prepareJudging, { gameId, questionId });
    expect(JSON.parse(job!.message).fields[0]).toMatchObject({ open: true, knownItems: ["Lund"] });
    expect(job?.items.map((item) => item.text)).toEqual(["gothenburg"]);
  });

  it("is null when there is nothing left to ask", async () => {
    const { t, gameId, questionId } = await setupJudging();
    await t.run(async (ctx) => {
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "kanel", target: null });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "safran", target: 0 });
    });
    await expect(t.query(internal.aiJudge.judging.prepareJudging, { gameId, questionId })).resolves.toBeNull();
  });

  it("is null once the hosts have turned the AI switch off", async () => {
    const { t, gameId, questionId } = await setupJudging({ ...freeText, fuzzy: false });
    await expect(t.query(internal.aiJudge.judging.prepareJudging, { gameId, questionId })).resolves.toBeNull();
  });

  it("is null for a question without typed answers", async () => {
    const { t, gameId, questionId } = await setupJudging({ type: "number", answer: 3, scoring: { mode: "closest", pointsByRank: [1] } });
    await expect(t.query(internal.aiJudge.judging.prepareJudging, { gameId, questionId })).resolves.toBeNull();
  });
});

describe("saveAiVerdicts", () => {
  it("saves the AI's verdicts as its own, keeps the hosts' and marks the judging done", async () => {
    const setup = await setupJudging();
    const { t, gameId, questionId } = setup;
    await markJudging(setup);
    await t.run((ctx) => ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "kanel", target: 0 }));
    await t.mutation(internal.aiJudge.judging.saveAiVerdicts, {
      gameId,
      questionId,
      verdicts: [
        { slot: 0, text: "safran", target: 0 },
        { slot: 0, text: "kanel", target: null },
      ],
    });
    const saved = await t.run(async (ctx) => ({
      verdicts: (await ctx.db.query("verdicts").collect()).map(({ text, target, byAi }) => ({ text, target, byAi })),
      judging: await aiJudgingOf(ctx, { gameId, questionId }),
    }));
    expect(saved.verdicts).toEqual([
      { text: "kanel", target: 0, byAi: undefined },
      { text: "safran", target: 0, byAi: true },
    ]);
    expect(saved.judging?.status).toBe("done");
  });
});

describe("failJudging", () => {
  it("marks the judging failed, so the hosts know to judge themselves", async () => {
    const setup = await setupJudging();
    const { t, gameId, questionId } = setup;
    await markJudging(setup);
    await t.mutation(internal.aiJudge.judging.failJudging, { gameId, questionId });
    expect((await t.run((ctx) => aiJudgingOf(ctx, { gameId, questionId })))?.status).toBe("failed");
  });
});

describe("a reply after the game was deleted", () => {
  it("leaves nothing behind", async () => {
    const setup = await setupJudging();
    const { t, gameId, questionId } = setup;
    await markJudging(setup);
    await t.run(async (ctx) => {
      const judging = await aiJudgingOf(ctx, { gameId, questionId });
      await ctx.db.delete("aiJudgings", judging!._id);
    });
    await t.mutation(internal.aiJudge.judging.saveAiVerdicts, { gameId, questionId, verdicts: [{ slot: 0, text: "safran", target: 0 }] });
    await t.mutation(internal.aiJudge.judging.failJudging, { gameId, questionId });
    const left = await t.run(async (ctx) => [...(await ctx.db.query("verdicts").collect()), ...(await ctx.db.query("aiJudgings").collect())]);
    expect(left).toEqual([]);
  });
});
