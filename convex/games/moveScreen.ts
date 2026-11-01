import { closeQuestion } from "@/domain/answers/closeQuestion";
import { questionClosedByStep } from "@/domain/answers/questionClosedByStep";
import { mediaOnScreen } from "@/domain/media/mediaOnScreen";
import { playbackForMedia } from "@/domain/playback/playbackForMedia";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import { stepScreen } from "@/domain/screenSequence/stepScreen";
import { startTimerForScreen } from "@/domain/timer/startTimerForScreen";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { lockDraftsOfQuestion } from "../answers/lockDraftsOfQuestion";
import { scheduleTimeOutLock } from "../answers/timeOut";
import type { Screen } from "./screen";
import { placeOfGame } from "./placeOfGame";
import { requireRunningGame } from "./requireRunningGame";

// Steps from the screen the host saw, and does nothing if the game has already moved on, so a
// double press or both hosts pressing at once moves only one screen. A question's timer starts
// over each time the question shows, also when stepping back to it, and so does its clip.
// Stepping on from a question closes it and locks its drafts (D41); a closed question shows
// again without a timer, as no one can answer it.
export async function moveScreen(ctx: MutationCtx, gameId: Id<"games">, from: Screen, step: 1 | -1) {
  const game = await requireRunningGame(ctx, gameId);
  const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
  if (!isSameScreen(sequence[screenIndex], from)) return;
  const closingId = questionClosedByStep(from, step);
  if (closingId !== null) await lockDraftsOfQuestion(ctx, gameId, closingId);
  const closedQuestionIds = closingId === null ? game.closedQuestionIds : closeQuestion(game.closedQuestionIds, closingId);
  const { screen, screenIndex: nextIndex } = stepScreen(sequence, game, step);
  const isClosed = screen.kind === "question" && closedQuestionIds?.includes(screen.questionId);
  const timer = isClosed ? undefined : startTimerForScreen(screen, rounds, Date.now());
  await ctx.db.patch("games", gameId, {
    screen,
    screenIndex: nextIndex,
    timer,
    playback: playbackForMedia(mediaOnScreen(screen, rounds)),
    closedQuestionIds,
  });
  await scheduleTimeOutLock(ctx, { _id: gameId, screen, timer });
}
