import { buildScreenSequence } from "@/domain/screenSequence/buildScreenSequence";
import { describeScreen } from "@/domain/screenSequence/describeScreen";
import { findScreenIndex } from "@/domain/screenSequence/findScreenIndex";
import { query } from "../_generated/server";
import { roundsWithQuestionsOfQuiz } from "../rounds/roundsWithQuestionsOfQuiz";
import { getOrThrow } from "../shared/getOrThrow";
import { findRunningGame } from "./findRunningGame";

// Public: the TV and the phones open whatever game is running and follow its screen. They get
// the screen and what it may show (describeScreen), never a question's answer key.
export const getRunningGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await findRunningGame(ctx);
    if (game === null) return null;
    const quiz = await getOrThrow(ctx, "quizzes", game.quizId);
    const rounds = await roundsWithQuestionsOfQuiz(ctx, game.quizId);
    const sequence = buildScreenSequence(rounds);
    const screen = sequence[findScreenIndex(sequence, game.screen, game.screenIndex)];
    return { _id: game._id, quizId: game.quizId, quizTitle: quiz.title, screen, view: describeScreen(screen, rounds) };
  },
});
