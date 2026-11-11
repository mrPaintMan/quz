import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { startAiJudging } from "../aiJudge/judging";
import { lockDraftsOfQuestion } from "./lockDraftsOfQuestion";

// Locks a question's answers for good, when every team has sent, the time is out or Nästa closes
// it: drafts lock as they are, and the AI judge starts the first time, so its verdicts are in
// before the hosts step on (D55).
export async function lockQuestion(ctx: MutationCtx, gameId: Id<"games">, questionId: Id<"questions">) {
  await lockDraftsOfQuestion(ctx, gameId, questionId);
  await startAiJudging(ctx, { gameId, questionId });
}
