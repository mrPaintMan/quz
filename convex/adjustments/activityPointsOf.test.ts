import { describe, expect, it } from "vitest";
import { activityPointsOf } from "./activityPointsOf";
import { atActivity } from "./manualPoints.setup";

describe("activityPointsOf", () => {
  it("gives an activity's points in a game, not corrections", async () => {
    const { t, gameId, questionId, red } = await atActivity();
    const points = await t.run(async (ctx) => {
      await ctx.db.insert("adjustments", { gameId, teamId: red, questionId, points: 3 });
      await ctx.db.insert("adjustments", { gameId, teamId: red, questionId: null, points: 1 });
      return activityPointsOf(ctx, gameId, questionId);
    });
    expect(points.map((adjustment) => adjustment.points)).toEqual([3]);
  });
});
