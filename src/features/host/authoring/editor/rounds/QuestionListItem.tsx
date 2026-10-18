"use client";

import type { ReactNode } from "react";
import type { Doc } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { findQuestionProblems } from "@/domain/questions/findQuestionProblems";
import { maxQuestionPoints } from "@/domain/questions/maxQuestionPoints";
import { RowButtons, type RowPosition } from "@/features/host/authoring/questionEditors/fields/RowButtons";
import { questionEditors } from "@/features/host/authoring/questionEditors/registry";
import { formatPoints } from "./formatPoints";

type QuestionListItemProps = {
  question: Doc<"questions">;
  number: number;
  selected: boolean;
  onSelect: () => void;
  dragHandle?: ReactNode;
  position?: RowPosition;
};

// The inside of one row in the round's question list; the list supplies the <li>.
export function QuestionListItem({ question, number, selected, onSelect, dragHandle, position }: QuestionListItemProps) {
  const ready = findQuestionProblems(question).length === 0;
  return (
    <>
      {dragHandle && <div className="self-center">{dragHandle}</div>}
      <button type="button" onClick={onSelect} aria-current={selected} className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg p-2 text-left">
        <span className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            F{number} · {questionEditors[question.content.type].label}
          </span>
          <span>{formatPoints(maxQuestionPoints(question.content))}</span>
        </span>
        <span className={question.prompt ? "line-clamp-2" : "italic text-muted-foreground"}>
          {question.prompt || "Ingen frågetext ännu"}
        </span>
        {!ready && <Badge variant="outline" className="border-primary/60 text-primary">Ej klar</Badge>}
      </button>
      <RowButtons name={`fråga ${number}`} position={position} />
    </>
  );
}
