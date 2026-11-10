import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { internal } from "../_generated/api";
import { markJudging, setupJudging } from "./aiJudgeGame.setup";
import { aiJudgingOf } from "./judging";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

const replyWith = (verdicts: unknown[], stop_reason = "end_turn") => ({
  stop_reason,
  content: [{ type: "text", text: JSON.stringify({ verdicts }) }],
});

async function judge() {
  const setup = await setupJudging();
  const { t, gameId, questionId } = setup;
  await markJudging(setup);
  await t.action(internal.aiJudge.judge.judgeQuestion, { gameId, questionId });
  return t.run(async (ctx) => ({
    verdicts: (await ctx.db.query("verdicts").collect()).map(({ text, target, byAi }) => ({ text, target, byAi })),
    status: (await aiJudgingOf(ctx, { gameId, questionId }))?.status,
  }));
}

describe("judgeQuestion", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    create.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.restoreAllMocks();
  });

  it("asks Claude Haiku once about the unjudged texts and saves its verdicts", async () => {
    // Sorted alphabetically: "kanel" is id 0, "safran" id 1.
    create.mockResolvedValue(replyWith([{ id: 0, verdict: "wrong", option: 0 }, { id: 1, verdict: "right", option: 0 }]));
    await expect(judge()).resolves.toEqual({
      verdicts: [
        { text: "kanel", target: null, byAi: true },
        { text: "safran", target: 0, byAi: true },
      ],
      status: "done",
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0]).toMatchObject({ model: "claude-haiku-5-5", output_config: { effort: "low", format: { type: "json_schema" } } });
  });

  it("leaves unsure texts for the hosts", async () => {
    create.mockResolvedValue(replyWith([{ id: 0, verdict: "unsure", option: 0 }, { id: 1, verdict: "unsure", option: 0 }]));
    await expect(judge()).resolves.toEqual({ verdicts: [], status: "done" });
  });

  it("leaves everything for the hosts when Claude declines, the call fails or no key is set", async () => {
    create.mockResolvedValueOnce(replyWith([], "refusal"));
    await expect(judge()).resolves.toEqual({ verdicts: [], status: "failed" });
    create.mockRejectedValueOnce(new Error("overloaded"));
    await expect(judge()).resolves.toEqual({ verdicts: [], status: "failed" });
    delete process.env.ANTHROPIC_API_KEY;
    await expect(judge()).resolves.toEqual({ verdicts: [], status: "failed" });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("marks the judging done without asking when nothing is left to judge", async () => {
    const setup = await setupJudging();
    const { t, gameId, questionId } = setup;
    await markJudging(setup);
    await t.run(async (ctx) => {
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "kanel", target: null });
      await ctx.db.insert("verdicts", { gameId, questionId, slot: 0, text: "safran", target: 0 });
    });
    await t.action(internal.aiJudge.judge.judgeQuestion, { gameId, questionId });
    expect(create).not.toHaveBeenCalled();
    expect((await t.run((ctx) => aiJudgingOf(ctx, { gameId, questionId })))?.status).toBe("done");
  });
});
