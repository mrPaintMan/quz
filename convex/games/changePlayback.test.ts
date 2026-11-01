import { describe, expect, it } from "vitest";
import { atLobby, setupConvexTest } from "../test.setup";
import type { Playback } from "./playback";
import { changePlayback } from "./changePlayback";

const paused = { kind: "paused" as const, positionMs: 0 };
const playFromStart = () => ({ kind: "playing" as const, startedAt: 7 });

async function changeFrom(stored: Playback | undefined) {
  const t = setupConvexTest();
  return t.run(async (ctx) => {
    const quizId = await ctx.db.insert("quizzes", { title: "Julquiz", year: 2026, updatedAt: 0 });
    const gameId = await ctx.db.insert("games", { quizId, endedAt: null, ...atLobby, playback: stored });
    await changePlayback(ctx, gameId, paused, playFromStart);
    return (await ctx.db.get("games", gameId))?.playback ?? null;
  });
}

describe("changePlayback", () => {
  it("saves the changed playback", async () => {
    await expect(changeFrom(paused)).resolves.toEqual({ kind: "playing", startedAt: 7 });
  });

  it("does nothing when the playback has changed since the host saw it", async () => {
    await expect(changeFrom({ kind: "paused", positionMs: 3 })).resolves.toEqual({ kind: "paused", positionMs: 3 });
  });

  it("leaves a game without a clip as it is", async () => {
    await expect(changeFrom(undefined)).resolves.toBeNull();
  });
});
