import { TEAM_COLOURS } from "@/domain/teams/teamColours";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

// Locks every team's draft for the question as it is, so a sleeping phone loses nothing it saved
// (D16). A game has at most one answer per team, and one team per colour.
export async function lockDraftsOfQuestion(ctx: MutationCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  const answers = await ctx.db
    .query("answers")
    .withIndex("by_gameId_and_questionId_and_lockedAt", (q) =>
      q.eq("gameId", gameId).eq("questionId", questionId).eq("lockedAt", null),
    )
    .take(TEAM_COLOURS.length);
  const now = Date.now();
  await Promise.all(answers.map((answer) => ctx.db.patch("answers", answer._id, { lockedAt: now })));
}
