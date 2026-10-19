"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import type { ContentOf, QuestionType } from "@convex/questions/questionContent";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findQuestionProblems } from "@/domain/questions/findQuestionProblems";
import { holdsOneQuestion } from "@/domain/rounds/holdsOneQuestion";
import { QuestionMediaField } from "@/features/host/authoring/media/QuestionMediaField";
import { NumberField } from "@/features/host/authoring/questionEditors/fields/NumberField";
import { questionEditors } from "@/features/host/authoring/questionEditors/registry";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useAutosave } from "@/features/host/authoring/shared/useAutosave";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { MoveToRoundSelect } from "./MoveToRoundSelect";
import { ProblemList } from "./ProblemList";
import { QuestionTypeSelect } from "./QuestionTypeSelect";

// moveQuestion clamps the index, so this places a moved question last in its new round.
const AT_END_OF_ROUND = Number.MAX_SAFE_INTEGER;

type Draft = Pick<Doc<"questions">, "prompt" | "timeLimitSeconds" | "hostNotes" | "content">;

function ContentEditor<T extends QuestionType>({
  content,
  onChange,
}: {
  content: ContentOf<T>;
  onChange: (content: ContentOf<T>) => void;
}) {
  // The registry pairs each type with its own editor; TypeScript can't follow the lookup.
  const { Editor } = questionEditors[content.type as T];
  return <Editor content={content} onChange={onChange} />;
}

type QuestionEditorProps = {
  question: Doc<"questions">;
  round: Doc<"rounds">;
  rounds: Doc<"rounds">[];
  onDeleted: () => void;
  onMoved: (roundId: Id<"rounds">) => void;
};

// Edits a local draft and autosaves it; remount with a new key when the question or its type changes.
export function QuestionEditor({ question, round, rounds, onDeleted, onMoved }: QuestionEditorProps) {
  const [draft, setDraft] = useState<Draft>(() => ({
    prompt: question.prompt,
    timeLimitSeconds: question.timeLimitSeconds,
    hostNotes: question.hostNotes,
    content: question.content,
  }));
  const updateQuestion = useHostMutation(api.questions.mutations.updateQuestion);
  const changeQuestionType = useHostMutation(api.questions.mutations.changeQuestionType);
  const deleteQuestion = useHostMutation(api.questions.mutations.deleteQuestion);
  const moveQuestion = useHostMutation(api.questions.mutations.moveQuestion);
  const run = useRunAction();

  const { saveFailed } = useAutosave(draft, (changes) => updateQuestion({ questionId: question._id, ...changes }));
  const edit = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));

  return (
    <div className="flex flex-col gap-5">
      <QuestionTypeSelect
        value={draft.content.type}
        roundKind={round.kind}
        onChange={(type) => run(() => changeQuestionType({ questionId: question._id, type }))}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="question-prompt">Fråga som visas på TV:n</Label>
        <Textarea
          id="question-prompt"
          rows={3}
          className="text-base"
          value={draft.prompt}
          onChange={(event) => edit({ prompt: event.target.value })}
        />
      </div>
      <ContentEditor content={draft.content} onChange={(content) => edit({ content })} />
      <NumberField
        label="Tidsgräns i sekunder (tomt = ingen)"
        value={draft.timeLimitSeconds}
        onChange={(timeLimitSeconds) => edit({ timeLimitSeconds })}
        className="max-w-72"
      />
      <QuestionMediaField question={question} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="question-notes">Anteckningar för domarna (visas inte på TV:n)</Label>
        <Textarea
          id="question-notes"
          rows={2}
          value={draft.hostNotes}
          onChange={(event) => edit({ hostNotes: event.target.value })}
        />
      </div>
      <ProblemList problems={findQuestionProblems({ ...draft, media: question.media })} />
      {saveFailed && (
        <p role="alert" className="text-sm text-destructive">
          Kunde inte spara. Kontrollera anslutningen; ändringen sparas igen vid nästa ändring.
        </p>
      )}
      {/* A På spåret trip belongs to its round for good: it goes when the round does (D30). */}
      {!holdsOneQuestion(round.kind) && (
        <div className="flex flex-wrap items-end justify-between gap-4 border-t pt-4">
          <MoveToRoundSelect
            currentRoundId={round._id}
            questionType={draft.content.type}
            rounds={rounds}
            onMove={(toRoundId) =>
              run(async () => {
                await moveQuestion({ questionId: question._id, toRoundId, toIndex: AT_END_OF_ROUND });
                onMoved(toRoundId);
              })
            }
          />
          <ConfirmButton
            title="Ta bort frågan?"
            description="Frågan tas bort från omgången. Det går inte att ångra."
            confirmLabel="Ta bort"
            onConfirm={() =>
              run(async () => {
                await deleteQuestion({ questionId: question._id });
                onDeleted();
              })
            }
          >
            Ta bort fråga
          </ConfirmButton>
        </div>
      )}
    </div>
  );
}
