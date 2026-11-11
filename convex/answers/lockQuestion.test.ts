import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aiJudgingOf } from "../aiJudge/judging";
import { setupJudging } from "../aiJudge/aiJudgeGame.setup";
import { lockQuestion } from "./lockQuestion";

describe("lockQuestion", () => {
  // Keeps convex-test from running the queued AI judge on its own.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("locks the drafts and starts the AI judge, once", async () => {
    const { t, gameId, questionId } = await setupJudging();
    const result = await t.run(async (ctx) => {
      await lockQuestion(ctx, gameId, questionId);
      await lockQuestion(ctx, gameId, questionId);
      const answers = await ctx.db.query("answers").collect();
      return {
        drafts: answers.filter((answer) => answer.lockedAt === null).length,
        judging: (await aiJudgingOf(ctx, { gameId, questionId }))?.status,
        scheduled: (await ctx.db.system.query("_scheduled_functions").collect()).length,
      };
    });
    expect(result).toEqual({ drafts: 0, judging: "judging", scheduled: 1 });
  });
});
