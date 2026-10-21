"use client";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import type { Film } from "@convex/rounds/table";
import { filmQuestionTypes } from "@/domain/rounds/filmQuestionTypes";
import { FilmField } from "@/features/host/authoring/media/FilmField";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { AddQuestionForm } from "./AddQuestionForm";
import { QuestionListItem } from "./QuestionListItem";
import { questionRowClassName } from "./questionRowClassName";

type FilmCardProps = {
  roundId: Id<"rounds">;
  film: Film;
  filmNumber: number;
  // The film's questions, each with its number in the round.
  questions: { question: Doc<"questions">; number: number }[];
  canAddQuestion: boolean;
  selectedQuestionId: Id<"questions"> | null;
  onSelectQuestion: (questionId: Id<"questions">) => void;
};

// One film of a På spåret round and the questions answered after it (D32).
export function FilmCard({ roundId, film, filmNumber, questions, canAddQuestion, selectedQuestionId, onSelectQuestion }: FilmCardProps) {
  const setFilmVideo = useHostMutation(api.rounds.filmMutations.setFilmVideo);
  const addFilmQuestion = useHostMutation(api.rounds.filmMutations.addFilmQuestion);
  const deleteFilm = useHostMutation(api.rounds.filmMutations.deleteFilm);
  const run = useRunAction();
  return (
    <section aria-label={`Film ${filmNumber}`} className="flex flex-col gap-2 rounded-xl border p-3">
      <h3 className="font-medium">Film {filmNumber}</h3>
      <FilmField title="Filmen" video={film.video} onChange={(video) => setFilmVideo({ roundId, filmId: film.id, video })} />
      <p className="text-sm text-muted-foreground">Frågorna besvaras efter filmen.</p>
      <ol className="flex flex-col gap-2">
        {questions.map(({ question, number }) => (
          <li key={question._id} className={questionRowClassName(question._id === selectedQuestionId)}>
            <QuestionListItem
              question={question}
              number={number}
              film={film.video}
              selected={question._id === selectedQuestionId}
              onSelect={() => onSelectQuestion(question._id)}
            />
          </li>
        ))}
      </ol>
      {canAddQuestion && (
        <AddQuestionForm
          label="Ny fråga till filmen av typen"
          buttonLabel="Lägg till fråga"
          types={filmQuestionTypes()}
          onAdd={(type) => run(async () => onSelectQuestion(await addFilmQuestion({ roundId, filmId: film.id, type })))}
        />
      )}
      <div>
        <ConfirmButton
          title={`Ta bort film ${filmNumber}?`}
          description={`Filmen och dess ${questions.length === 1 ? "fråga" : `${questions.length} frågor`} tas bort. Det går inte att ångra.`}
          confirmLabel="Ta bort"
          size="sm"
          onConfirm={() => run(() => deleteFilm({ roundId, filmId: film.id }))}
        >
          Ta bort film
        </ConfirmButton>
      </div>
    </section>
  );
}
