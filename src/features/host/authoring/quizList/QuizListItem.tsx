"use client";

import Link from "next/link";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { formatSavedAgo } from "@/domain/time/formatSavedAgo";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";

type QuizListItemProps = {
  quiz: Doc<"quizzes">;
  now: number;
  onCopy: () => void;
  onDelete: () => void;
};

export function QuizListItem({ quiz, now, onCopy, onDelete }: QuizListItemProps) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
      <div className="min-w-0 flex-1">
        <Link href={`/admin/quizzes/${quiz._id}`} className="text-lg font-semibold hover:text-primary">
          {quiz.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {quiz.year} · {formatSavedAgo(quiz.updatedAt, now)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onCopy}>
          Kopiera
        </Button>
        <ConfirmButton
          title={`Ta bort ${quiz.title}?`}
          description="Alla omgångar och frågor i quizet tas bort. Det går inte att ångra."
          confirmLabel="Ta bort"
          onConfirm={onDelete}
        >
          Ta bort
        </ConfirmButton>
      </div>
    </li>
  );
}
