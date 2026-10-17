"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { useAutosave } from "@/features/host/authoring/editor/question/useAutosave";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

export function QuizTitleField({ quiz }: { quiz: Doc<"quizzes"> }) {
  const [title, setTitle] = useState(quiz.title);
  const [saveFailed, setSaveFailed] = useState(false);
  const updateQuiz = useHostMutation(api.quizzes.mutations.updateQuiz);
  useAutosave(title, (value) => {
    updateQuiz({ quizId: quiz._id, title: value }).then(
      () => setSaveFailed(false),
      () => setSaveFailed(true),
    );
  });
  return (
    <>
      <Input
        aria-label="Quizets namn"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="h-9 max-w-80 border-transparent bg-transparent text-lg font-semibold hover:border-border"
      />
      {saveFailed && (
        <span role="alert" className="text-sm text-destructive">
          Kunde inte spara namnet.
        </span>
      )}
    </>
  );
}
