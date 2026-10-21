"use client";

import { useId, useState } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allowedQuestionTypes } from "@/domain/rounds/allowedQuestionTypes";
import { hasFixedQuestionList } from "@/domain/rounds/hasFixedQuestionList";
import { useAutosave } from "@/features/host/authoring/shared/useAutosave";
import { SortableList } from "@/features/host/authoring/shared/SortableList";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { AddQuestionForm } from "./AddQuestionForm";
import { PaSparetQuestions } from "./PaSparetQuestions";
import { QuestionListItem } from "./QuestionListItem";
import { questionRowClassName } from "./questionRowClassName";
import type { RoundWithQuestions } from "@/features/host/authoring/editor/RoundWithQuestions";

type RoundPanelProps = {
  round: RoundWithQuestions;
  selectedQuestionId: Id<"questions"> | null;
  onSelectQuestion: (questionId: Id<"questions">) => void;
  onDeleted: () => void;
};

export function RoundPanel({ round, selectedQuestionId, onSelectQuestion, onDeleted }: RoundPanelProps) {
  const titleId = useId();
  const [title, setTitle] = useState(round.title);
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
      {hasFixedQuestionList(round.kind) ? (
        <PaSparetQuestions round={round} selectedQuestionId={selectedQuestionId} onSelectQuestion={onSelectQuestion} />
      ) : (
        <>
          <SortableList
            items={round.questions}
            getId={(question) => question._id}
            nameOf={(index) => `fråga ${index + 1}`}
            onMove={(question, _fromIndex, toIndex) => move(question._id, toIndex)}
            className="flex flex-col gap-2"
            itemClassName={(question) => questionRowClassName(question._id === selectedQuestionId)}
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
          {round.questions.length === 0 && <p className="text-sm text-muted-foreground">Inga frågor ännu.</p>}
          <AddQuestionForm
            label="Ny fråga av typen"
            buttonLabel="Lägg till fråga"
            types={allowedQuestionTypes(round.kind)}
            onAdd={(type) => run(async () => onSelectQuestion(await addQuestion({ roundId: round._id, type })))}
          />
        </>
      )}
      <div className="pt-2">
        <ConfirmButton
          title={`Ta bort ${round.title || "omgången"}?`}
          description={
            isPaSparet
              ? "Omgången med resan, filmerna och deras frågor tas bort. Det går inte att ångra."
              : `Omgången och dess ${round.questions.length} frågor tas bort. Det går inte att ångra.`
          }
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
