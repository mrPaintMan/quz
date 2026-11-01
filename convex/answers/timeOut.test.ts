import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { host, setupConvexTest } from "../test.setup";
import type { Timer } from "../games/timer";

// A game showing a number question with its timer, and a team's draft for it.
async function withDraft(timer: Timer) {
  const t = setupConvexTest();
  const ids = await t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const roundId = await ctx.db.insert("rounds", { quizId, position: 0, title: "Siffror", kind: "questions" });
    const questionId = await ctx.db.insert("questions", {
      quizId,
      roundId,
      position: 0,
      prompt: "Hur många renar har tomten?",
      timeLimitSeconds: 30,
      media: null,
      hostNotes: "",
      content: { type: "number", answer: 9, scoring: { mode: "closest", pointsByRank: [3, 2, 1] } },
    });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, screen: { kind: "question", questionId }, screenIndex: 3, timer });
    const teamId = await ctx.db.insert("teams", { gameId, name: "Tomtarna", colour: "red" });
    const answerId = await ctx.db.insert("answers", { gameId, teamId, questionId, content: { type: "number", value: 7 }, lockedAt: null });
    return { questionId, gameId, answerId };
  });
  const lockedAt = async () => (await t.run((ctx) => ctx.db.get("answers", ids.answerId)))?.lockedAt;
  return { t, ...ids, lockedAt };
}

describe("lockDraftsAtTimeOut", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(132_001);
  });

  afterEach(() => vi.useRealTimers());

  it("locks the drafts when the timer it was scheduled for runs out", async () => {
    const { t, gameId, questionId, lockedAt } = await withDraft({ kind: "running", endsAt: 130_000 });
    await t.mutation(internal.answers.timeOut.lockDraftsAtTimeOut, { gameId, questionId, endsAt: 130_000 });
    expect(await lockedAt()).toBe(132_001);
  });

  it.each<[string, Timer]>([
    ["paused", { kind: "paused", remainingMs: 5_000 }],
    ["extended", { kind: "running", endsAt: 145_000 }],
  ])("does nothing when the timer has been %s since", async (_change, timer) => {
    const { t, gameId, questionId, lockedAt } = await withDraft(timer);
    await t.mutation(internal.answers.timeOut.lockDraftsAtTimeOut, { gameId, questionId, endsAt: 130_000 });
    expect(await lockedAt()).toBeNull();
  });

  it("is scheduled for 2 seconds after the time is out, and again when the timer changes", async () => {
    vi.setSystemTime(100_000);
    const { t, gameId } = await withDraft({ kind: "running", endsAt: 130_000 });
    await t.mutation(api.games.mutations.extendGameTimer, { ...host, gameId, from: { kind: "running", endsAt: 130_000 } });
    const scheduled = await t.run((ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled.map((job) => job.scheduledTime)).toEqual([147_000]);
  });
});
