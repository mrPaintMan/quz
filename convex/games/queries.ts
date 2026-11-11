import { v } from "convex/values";
import { tripOnScreen } from "@/domain/questionTypes/paSparet/tripOnScreen";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import { query } from "../_generated/server";
import { hostQuery } from "../auth/hostFunctions";
import { getOrThrow } from "../shared/getOrThrow";
import { findRunningGame } from "./findRunningGame";
import { placeOfGame } from "./placeOfGame";
import { showScreen } from "./showScreen";

// Public: the TV and the phones open whatever game is running and follow its screen. They get
// the screen and what it may show (describeScreen), never a question's answer key. The timer and
// the clip belong to the screen they started on, so they are left out if that screen has gone
// from the quiz.
export const getRunningGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await findRunningGame(ctx);
    if (game === null) return null;
    const quiz = await getOrThrow(ctx, "quizzes", game.quizId);
    const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
    const screen = sequence[screenIndex];
    const isStoredScreen = isSameScreen(screen, game.screen);
    return {
      _id: game._id,
      quizId: game.quizId,
      quizTitle: quiz.title,
      screen,
      ...(await showScreen(ctx, game._id, screen, rounds)),
      timer: isStoredScreen ? (game.timer ?? null) : null,
      playback: isStoredScreen ? (game.playback ?? null) : null,
      // A question stepped on from takes no more answers, even when shown again (D41).
      isQuestionClosed: screen.kind === "question" && (game.closedQuestionIds ?? []).includes(screen.questionId),
    };
  },
});

// For the hosts' preview of what comes next; host-only, so a team can't read the next
// question early. null after the last screen and for an ended game.
export const getNextScreen = hostQuery({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await getOrThrow(ctx, "games", gameId);
    if (game.endedAt !== null) return null;
    const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
    const next = sequence[screenIndex + 1];
    return next === undefined ? null : showScreen(ctx, game._id, next, rounds);
  },
});

// For the hosts' line on the trip's active clue; host-only, as the clues give the destination
// away. null on any other screen and for an ended game.
export const getShowingTrip = hostQuery({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await getOrThrow(ctx, "games", gameId);
    if (game.endedAt !== null) return null;
    const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
    return tripOnScreen(sequence[screenIndex], rounds);
  },
});
