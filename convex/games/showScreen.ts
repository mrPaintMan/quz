import { imageIdsOnScreen } from "@/domain/answering/imageIdsOnScreen";
import { answeringOf } from "@/domain/answering/registry";
import { isAnswerFor } from "@/domain/answers/isAnswerFor";
import { mediaOnScreen } from "@/domain/media/mediaOnScreen";
import { describeScreen } from "@/domain/screenSequence/describeScreen";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { lockedAnswersOfQuestion } from "../answers/lockedAnswersOfQuestion";
import { linkImages } from "../media/linkImages";
import { linkScreenMedia } from "../media/linkScreenMedia";
import { verdictsOfQuestion } from "../verdicts/verdictsOfQuestion";
import type { Screen } from "./screen";

type RoundWithQuestions = Doc<"rounds"> & { questions: Doc<"questions">[] };

// The sent answers and verdicts of an answer screen's question, for a type that reveals what the
// teams got right (a list, D53); undefined for every other screen, which reads no answers.
async function gradedOnScreen(ctx: QueryCtx, gameId: Id<"games">, screen: Screen, rounds: RoundWithQuestions[]) {
  if (screen.kind !== "answer") return undefined;
  const question = rounds.flatMap((round) => round.questions).find((candidate) => candidate._id === screen.questionId);
  if (!question || !answeringOf(question.content)?.revealsAnswers) return undefined;
  const answers = (await lockedAnswersOfQuestion(ctx, gameId, question._id))
    .map((answer) => answer.content)
    .filter((answer) => isAnswerFor(question.content, answer));
  return { answers, verdicts: await verdictsOfQuestion(ctx, gameId, question._id) };
}

// Everything the TV draws for a screen: what it may say (describeScreen), its media, and links to
// the question's own pictures, such as image options, by their file.
export async function showScreen(ctx: QueryCtx, gameId: Id<"games">, screen: Screen, rounds: RoundWithQuestions[]) {
  return {
    view: describeScreen(screen, rounds, await gradedOnScreen(ctx, gameId, screen, rounds)),
    media: await linkScreenMedia(ctx, mediaOnScreen(screen, rounds)),
    imageUrls: await linkImages(ctx, imageIdsOnScreen(screen, rounds)),
  };
}
