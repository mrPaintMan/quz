import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

// Places the questions in roundId in the given order, touching only questions that moved.
export async function saveQuestionOrder(
  ctx: MutationCtx,
  roundId: Id<"rounds">,
  questions: Doc<"questions">[],
): Promise<void> {
  await Promise.all(
    questions.map((question, position) =>
      question.position === position && question.roundId === roundId
        ? null
        : ctx.db.patch("questions", question._id, { position, roundId }),
    ),
  );
}
