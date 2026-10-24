import { findScreenIndex } from "@/domain/screenSequence/findScreenIndex";
import { query } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import { findRunningGame } from "./findRunningGame";
import { screenSequenceOfQuiz } from "./screenSequenceOfQuiz";

// Public: the TV and the phones open whatever game is running and follow its screen. Only the
// quiz's title and the screen are shown, never the questions themselves.
export const getRunningGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await findRunningGame(ctx);
    if (game === null) return null;
    const quiz = await getOrThrow(ctx, "quizzes", game.quizId);
    const sequence = await screenSequenceOfQuiz(ctx, game.quizId);
    const screen = sequence[findScreenIndex(sequence, game.screen, game.screenIndex)];
    return { _id: game._id, quizTitle: quiz.title, screen };
  },
});
