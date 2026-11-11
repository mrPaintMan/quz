import { closeQuestion } from "@/domain/answers/closeQuestion";
import { isQuestionLocked } from "@/domain/answers/isQuestionLocked";
import { questionClosedByStep } from "@/domain/answers/questionClosedByStep";
import { mediaOnScreen } from "@/domain/media/mediaOnScreen";
import { playbackForMedia } from "@/domain/playback/playbackForMedia";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import { stepScreen } from "@/domain/screenSequence/stepScreen";
import { startTimerForScreen } from "@/domain/timer/startTimerForScreen";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { lockQuestion } from "../answers/lockQuestion";
import { scheduleTimeOutLock } from "../answers/timeOut";
import { judgingOfQuestion } from "../verdicts/judgingOfQuestion";
import type { Screen } from "./screen";
import { placeOfGame } from "./placeOfGame";
import { requireRunningGame } from "./requireRunningGame";

// Steps from the screen the host saw, and does nothing if the game has already moved on, so a
// double press or both hosts pressing at once moves only one screen. A question's timer starts
// over each time the question shows, also when stepping back to it, and so does its clip.
// Stepping on from a question closes it and locks its answers (D41), which starts the AI judge if
// it hasn't yet (D55); stepping on waits while answers are judged. A closed question shows again
// without a timer, as no one can answer it.
export async function moveScreen(ctx: MutationCtx, gameId: Id<"games">, from: Screen, step: 1 | -1) {
  const game = await requireRunningGame(ctx, gameId);
  const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
  if (!isSameScreen(sequence[screenIndex], from)) return;
  if (step === 1) await requireJudged(ctx, game, from, rounds);
  const closingId = questionClosedByStep(from, step);
  if (closingId !== null) await lockQuestion(ctx, gameId, closingId);
  const closedQuestionIds = closingId === null ? game.closedQuestionIds : closeQuestion(game.closedQuestionIds, closingId);
  const { screen, screenIndex: nextIndex } = stepScreen(sequence, game, step);
  const isClosed = screen.kind === "question" && isQuestionLocked({ ...game, closedQuestionIds }, screen.questionId);
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

// Nästa waits on a question, or its answer screen, while its answers are being judged, so the
// answer and the scores are final when they show (D55).
async function requireJudged(ctx: MutationCtx, game: Doc<"games">, from: Screen, rounds: { questions: Doc<"questions">[] }[]) {
  if (from.kind !== "question" && from.kind !== "answer") return;
  const question = rounds.flatMap((round) => round.questions).find((candidate) => candidate._id === from.questionId);
  if (question && !(await judgingOfQuestion(ctx, game, question)).canStepOn) {
    throw new ConvexError("Alla svar behöver bedömas innan ni går vidare.");
  }
}
