import { ConvexError } from "convex/values";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { isTimeOut } from "@/domain/answers/isTimeOut";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { placeOfGame } from "../games/placeOfGame";
import { getOrThrow } from "../shared/getOrThrow";
import type { AnswerContent } from "./answerContent";

// A team may answer only the question on the TV now, while it is open and its time isn't out,
// with an answer of its type, and only until it has sent one (D16, D41). Gives the team's game
// and its answer so far, if any.
export async function requireAnswerable(ctx: QueryCtx, teamId: Id<"teams">, questionId: Id<"questions">, content: AnswerContent) {
  const team = await getOrThrow(ctx, "teams", teamId);
  const game = await getOrThrow(ctx, "games", team.gameId);
  if (game.endedAt !== null) {
    throw new ConvexError("Quizet är slut.");
  }
  const { sequence, screenIndex } = await placeOfGame(ctx, game);
  const isShowing = isSameScreen(sequence[screenIndex], { kind: "question", questionId });
  if (!isShowing || game.closedQuestionIds?.includes(questionId)) {
    throw new ConvexError("Frågan tar inte emot svar just nu.");
  }
  if (isTimeOut(game.timer, Date.now())) {
    throw new ConvexError("Tiden är ute.");
  }
  const question = await getOrThrow(ctx, "questions", questionId);
  if (!isAnswerFor(question.content, content)) {
    throw new ConvexError("Svaret passar inte frågan.");
  }
  const answer = await ctx.db
    .query("answers")
    .withIndex("by_teamId_and_questionId", (q) => q.eq("teamId", teamId).eq("questionId", questionId))
    .unique();
  if (answer !== null && answer.lockedAt !== null) {
    throw new ConvexError("Ni har redan skickat ert svar.");
  }
  return { game, answer };
}
