"use client";

import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { HostHeader } from "@/features/host/shared/HostHeader";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { useHostQuery } from "@/features/host/shared/useHostQuery";
import { useNow } from "@/features/host/shared/useNow";
import { CreateQuizForm } from "./CreateQuizForm";
import { QuizListItem } from "./QuizListItem";

export function QuizList() {
  const router = useRouter();
  const now = useNow();
  const quizzes = useHostQuery(api.quizzes.queries.listQuizzes, {});
  const createQuiz = useHostMutation(api.quizzes.mutations.createQuiz);
  const copyQuiz = useHostMutation(api.quizzes.mutations.copyQuiz);
  const deleteQuiz = useHostMutation(api.quizzes.mutations.deleteQuiz);
  const openQuiz = (quizId: string) => router.push(`/admin/quizzes/${quizId}`);

  async function copy(quiz: Doc<"quizzes">) {
    const nextYear = quiz.year + 1;
    openQuiz(await copyQuiz({ quizId: quiz._id, title: quiz.title.replace(String(quiz.year), String(nextYear)), year: nextYear }));
  }

  return (
    <div className="flex min-h-svh flex-col">
      <HostHeader>
        <h1 className="text-lg font-semibold">Dina quiz</h1>
      </HostHeader>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <CreateQuizForm
          defaultYear={new Date(now).getFullYear()}
          onCreate={async (quiz) => openQuiz(await createQuiz(quiz))}
        />
        {quizzes === undefined && <p className="text-muted-foreground">Hämtar quiz…</p>}
        {quizzes?.length === 0 && <p className="text-muted-foreground">Inga quiz ännu. Skapa det första ovan.</p>}
        {quizzes && quizzes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {quizzes.map((quiz) => (
              <QuizListItem
                key={quiz._id}
                quiz={quiz}
                now={now}
                onCopy={() => copy(quiz)}
                onDelete={() => deleteQuiz({ quizId: quiz._id })}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
