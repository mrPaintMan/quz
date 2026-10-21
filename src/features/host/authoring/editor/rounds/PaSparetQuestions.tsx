"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { filmsOf } from "@/domain/rounds/filmOf";
import { filmQuestionTypes, MAX_FILM_QUESTIONS } from "@/domain/rounds/filmQuestionTypes";
import type { RoundWithQuestions } from "@/features/host/authoring/editor/RoundWithQuestions";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { AddQuestionForm } from "./AddQuestionForm";
import { FilmCard } from "./FilmCard";
import { QuestionListItem } from "./QuestionListItem";
import { questionRowClassName } from "./questionRowClassName";

type PaSparetQuestionsProps = {
  round: RoundWithQuestions;
  selectedQuestionId: Id<"questions"> | null;
  onSelectQuestion: (questionId: Id<"questions">) => void;
};

// A På spåret round in its fixed order: the trip, then each film with its questions (D30, D33).
export function PaSparetQuestions({ round, selectedQuestionId, onSelectQuestion }: PaSparetQuestionsProps) {
  const addFilm = useHostMutation(api.rounds.filmMutations.addFilm);
  const run = useRunAction();
  // The server keeps the order, so a question's number is its place in the round.
  const numbered = round.questions.map((question, index) => ({ question, number: index + 1 }));
  const trip = numbered.find(({ question }) => question.filmId === undefined);
  const hasRoom = numbered.filter(({ question }) => question.filmId !== undefined).length < MAX_FILM_QUESTIONS;

  return (
    <div className="flex flex-col gap-3">
      {trip && (
        <div className={questionRowClassName(trip.question._id === selectedQuestionId)}>
          <QuestionListItem
            question={trip.question}
            number={trip.number}
            selected={trip.question._id === selectedQuestionId}
            onSelect={() => onSelectQuestion(trip.question._id)}
          />
        </div>
      )}
      {filmsOf(round).map((film, index) => (
        <FilmCard
          key={film.id}
          roundId={round._id}
          film={film}
          filmNumber={index + 1}
          questions={numbered.filter(({ question }) => question.filmId === film.id)}
          canAddQuestion={hasRoom}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={onSelectQuestion}
        />
      ))}
      {hasRoom ? (
        <AddQuestionForm
          label="Ny film, med en första fråga av typen"
          buttonLabel="Lägg till film"
          types={filmQuestionTypes()}
          onAdd={(type) => run(async () => onSelectQuestion((await addFilm({ roundId: round._id, type })).questionId))}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Omgången har {MAX_FILM_QUESTIONS} frågor till sina filmer, det högsta antalet.
        </p>
      )}
    </div>
  );
}
