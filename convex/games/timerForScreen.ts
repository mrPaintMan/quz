import { startTimer } from "@/domain/timer/startTimer";
import type { QueryCtx } from "../_generated/server";
import type { Screen } from "./screen";

// A fresh timer when the screen is a question with a time limit; none on every other screen.
export async function timerForScreen(ctx: QueryCtx, screen: Screen) {
  if (screen.kind !== "question") return undefined;
  const question = await ctx.db.get("questions", screen.questionId);
  return startTimer(question?.timeLimitSeconds ?? null, Date.now());
}
