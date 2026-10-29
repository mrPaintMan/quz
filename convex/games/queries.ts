import { v } from "convex/values";
import { describeScreen } from "@/domain/screenSequence/describeScreen";
import { isSameScreen } from "@/domain/screenSequence/isSameScreen";
import { query } from "../_generated/server";
import { hostQuery } from "../auth/hostFunctions";
import { getOrThrow } from "../shared/getOrThrow";
import { findRunningGame } from "./findRunningGame";
import { placeOfGame } from "./placeOfGame";

// Public: the TV and the phones open whatever game is running and follow its screen. They get
// the screen and what it may show (describeScreen), never a question's answer key. The timer
// belongs to the screen it started on, so it is left out if that screen has gone from the quiz.
export const getRunningGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await findRunningGame(ctx);
    if (game === null) return null;
    const quiz = await getOrThrow(ctx, "quizzes", game.quizId);
    const { rounds, sequence, screenIndex } = await placeOfGame(ctx, game);
    const screen = sequence[screenIndex];
    const timer = isSameScreen(screen, game.screen) ? (game.timer ?? null) : null;
    return { _id: game._id, quizId: game.quizId, quizTitle: quiz.title, screen, view: describeScreen(screen, rounds), timer };
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
    return next === undefined ? null : describeScreen(next, rounds);
  },
});
