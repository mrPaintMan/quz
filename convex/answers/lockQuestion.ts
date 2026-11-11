import { closeQuestion } from "@/domain/answers/closeQuestion";
import { isQuestionLocked } from "@/domain/answers/isQuestionLocked";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { startAiJudging } from "../aiJudge/judging";
import { lockDraftsOfQuestion } from "./lockDraftsOfQuestion";

// Locks a question's answers for good, when every team has sent, the time is out or Nästa closes
// it: the game records the lock, so no team can answer after it, drafts lock as they are, and the
// AI judge starts the first time, so its verdicts are in before the hosts step on (D55).
export async function lockQuestion(ctx: MutationCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  const game = await ctx.db.get("games", gameId);
  if (game && !isQuestionLocked(game, questionId)) {
    await ctx.db.patch("games", gameId, { lockedQuestionIds: closeQuestion(game.lockedQuestionIds, questionId) });
  }
  await lockDraftsOfQuestion(ctx, gameId, questionId);
  await startAiJudging(ctx, { gameId, questionId });
}
