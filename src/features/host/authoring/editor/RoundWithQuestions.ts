import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

type QuizTree = NonNullable<FunctionReturnType<typeof api.quizzes.queries.getQuizTree>>;

// One round of the editor's live quiz tree, with its questions in order.
export type RoundWithQuestions = QuizTree["rounds"][number];
