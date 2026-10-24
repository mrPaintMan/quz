import { createEmptyContent } from "@/domain/questions/createEmptyContent";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { QuestionType } from "./questionContent";

// A new, empty question of the given type at a position in the round, asked after a film when
// filmId is given (D33).
export async function insertQuestion(
  ctx: MutationCtx,
  round: Doc<"rounds">,
  position: number,
  type: QuestionType,
  filmId?: string,
): Promise<Id<"questions">> {
  return ctx.db.insert("questions", {
    quizId: round.quizId,
    roundId: round._id,
    position,
    prompt: "",
    timeLimitSeconds: null,
    media: null,
    hostNotes: "",
    content: createEmptyContent(type),
    ...(filmId === undefined ? {} : { filmId }),
  });
}
