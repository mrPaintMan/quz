"use client";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import type { Film } from "@convex/rounds/table";
import { Clapperboard } from "lucide-react";
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
  selectedQuestionId: Id<"questions"> | null;
  onSelectQuestion: (questionId: Id<"questions">) => void;
};

// One film of a På spåret round and the questions answered after it (D33): the film is a row in
// the questions' colour, and its questions hang under it along a gold line (D70).
export function FilmCard({ roundId, film, filmNumber, questions, selectedQuestionId, onSelectQuestion }: FilmCardProps) {
  const setFilmVideo = useHostMutation(api.rounds.filmMutations.setFilmVideo);
  const addFilmQuestion = useHostMutation(api.rounds.filmMutations.addFilmQuestion);
  const deleteFilm = useHostMutation(api.rounds.filmMutations.deleteFilm);
  const run = useRunAction();
  const count = questions.length === 1 ? "1 fråga" : `${questions.length} frågor`;
  return (
    <section aria-label={`Film ${filmNumber}`} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-3">
        <div className="flex items-center gap-2">
          <Clapperboard aria-hidden className="size-7 rounded-md bg-secondary p-1.5" />
          <h3 className="font-semibold">Film {filmNumber}</h3>
          <span className="ml-auto text-sm text-muted-foreground">{count}</span>
        </div>
        <FilmField title={`Filmen till film ${filmNumber}`} compact video={film.video} onChange={(video) => setFilmVideo({ roundId, filmId: film.id, video })} />
      </div>
      <div className="ml-4 flex flex-col gap-2 border-l-2 border-primary pl-3">
        <ol className="flex flex-col gap-2" aria-label={`Frågor efter film ${filmNumber}`}>
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
        <AddQuestionForm
          label="Ny fråga till filmen av typen"
          buttonLabel="Lägg till fråga"
          types={filmQuestionTypes()}
          onAdd={(type) => run(async () => onSelectQuestion(await addFilmQuestion({ roundId, filmId: film.id, type })))}
        />
        <div>
          <ConfirmButton
            title={`Ta bort film ${filmNumber}?`}
            description={`Filmen och dess ${questions.length === 1 ? "fråga" : count} tas bort. Det går inte att ångra.`}
            confirmLabel="Ta bort"
            size="sm"
            onConfirm={() => run(() => deleteFilm({ roundId, filmId: film.id }))}
          >
            Ta bort film {filmNumber} med frågor
          </ConfirmButton>
        </div>
      </div>
    </section>
  );
}
