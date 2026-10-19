"use client";

import { useId, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { QuestionType } from "@convex/questions/questionContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allowedQuestionTypes } from "@/domain/rounds/allowedQuestionTypes";
import { useAutosave } from "@/features/host/authoring/shared/useAutosave";
import { SortableList } from "@/features/host/authoring/shared/SortableList";
import { questionEditors } from "@/features/host/authoring/questionEditors/registry";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { QuestionListItem } from "./QuestionListItem";
import type { RoundWithQuestions } from "@/features/host/authoring/editor/RoundWithQuestions";

type RoundPanelProps = {
  round: RoundWithQuestions;
  selectedQuestionId: Id<"questions"> | null;
  onSelectQuestion: (questionId: Id<"questions">) => void;
  onDeleted: () => void;
};

export function RoundPanel({ round, selectedQuestionId, onSelectQuestion, onDeleted }: RoundPanelProps) {
  const titleId = useId();
  const typeId = useId();
  const [title, setTitle] = useState(round.title);
  const types = allowedQuestionTypes(round.kind);
  const [newType, setNewType] = useState<QuestionType>(types[0]);
  const renameRound = useHostMutation(api.rounds.mutations.renameRound);
  const deleteRound = useHostMutation(api.rounds.mutations.deleteRound);
  const addQuestion = useHostMutation(api.questions.mutations.addQuestion);
  const moveQuestion = useHostMutation(api.questions.mutations.moveQuestion);
  const { saveFailed: renameFailed } = useAutosave(title, (value) => renameRound({ roundId: round._id, title: value }));

  const run = useRunAction();
  const move = (questionId: Id<"questions">, toIndex: number) =>
    run(() => moveQuestion({ questionId, toRoundId: round._id, toIndex }));
  const isPaSparet = round.kind === "paSparet";

  return (
    <section className="flex flex-col gap-3" aria-label="Omgångens frågor">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={titleId}>{isPaSparet ? "Omgångens namn" : "Omgångens namn och tema"}</Label>
        <Input id={titleId} value={title} onChange={(event) => setTitle(event.target.value)} className="text-base font-semibold" />
        {renameFailed && (
          <p role="alert" className="text-sm text-destructive">
            Kunde inte spara namnet.
          </p>
        )}
      </div>
      <SortableList
        items={round.questions}
        getId={(question) => question._id}
        nameOf={(index) => `fråga ${index + 1}`}
        onMove={(question, _fromIndex, toIndex) => move(question._id, toIndex)}
        className="flex flex-col gap-2"
        itemClassName={(question) =>
          `flex items-start gap-1 rounded-xl border p-1 ${question._id === selectedQuestionId ? "border-primary bg-secondary" : "bg-card"}`
        }
        renderItem={(question, { index, dragHandle }) => (
          <QuestionListItem
            question={question}
            number={index + 1}
            selected={question._id === selectedQuestionId}
            onSelect={() => onSelectQuestion(question._id)}
            dragHandle={dragHandle}
          />
        )}
      />
      {round.questions.length === 0 && (
        <p className="text-sm text-muted-foreground">{isPaSparet ? "Inga resor ännu." : "Inga frågor ännu."}</p>
      )}
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed p-3">
        {!isPaSparet && (
          <div className="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label htmlFor={typeId}>Ny fråga av typen</Label>
            <select
              id={typeId}
              value={newType}
              onChange={(event) => setNewType(event.target.value as QuestionType)}
              className="h-9 rounded-lg border bg-background pl-3 pr-9 text-sm"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {questionEditors[type].label}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => run(async () => onSelectQuestion(await addQuestion({ roundId: round._id, type: newType })))}
        >
          {isPaSparet ? "Lägg till resa" : "Lägg till fråga"}
        </Button>
      </div>
      <div className="pt-2">
        <ConfirmButton
          title={`Ta bort ${round.title || "omgången"}?`}
          description={`Omgången och dess ${round.questions.length} frågor tas bort. Det går inte att ångra.`}
          confirmLabel="Ta bort"
          size="sm"
          onConfirm={() =>
            run(async () => {
              await deleteRound({ roundId: round._id });
              onDeleted();
            })
          }
        >
          Ta bort omgång
        </ConfirmButton>
      </div>
    </section>
  );
}
