import type { Id } from "@convex/_generated/dataModel";
import { QuizEditor } from "@/features/host/authoring/editor/quiz/QuizEditor";

export default async function QuizEditorPage({ params }: PageProps<"/admin/quizzes/[quizId]">) {
  const { quizId } = await params;
  return <QuizEditor quizId={quizId as Id<"quizzes">} />;
}
