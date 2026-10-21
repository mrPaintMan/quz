import { query } from "../_generated/server";
import { getOrThrow } from "../shared/getOrThrow";
import { findRunningGame } from "./findRunningGame";

// Public: the TV and the phones open whatever game is running. Only the quiz's title is
// shown, never its questions.
export const getRunningGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await findRunningGame(ctx);
    if (game === null) return null;
    const quiz = await getOrThrow(ctx, "quizzes", game.quizId);
    return { _id: game._id, quizTitle: quiz.title };
  },
});
