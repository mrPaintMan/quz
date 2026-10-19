"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { SortableList } from "@/features/host/authoring/shared/SortableList";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { AddRoundForm } from "./AddRoundForm";
import type { RoundWithQuestions } from "@/features/host/authoring/editor/RoundWithQuestions";

type RoundListProps = {
  quizId: Id<"quizzes">;
  rounds: RoundWithQuestions[];
  selectedRoundId: Id<"rounds"> | null;
  onSelectRound: (roundId: Id<"rounds">) => void;
};

function countLabel(round: RoundWithQuestions): string {
  const count = round.questions.length;
  if (round.kind === "paSparet") return count === 1 ? "1 resa" : `${count} resor`;
  return count === 1 ? "1 fråga" : `${count} frågor`;
}

export function RoundList({ quizId, rounds, selectedRoundId, onSelectRound }: RoundListProps) {
  const addRound = useHostMutation(api.rounds.mutations.addRound);
  const moveRound = useHostMutation(api.rounds.mutations.moveRound);
  const run = useRunAction();
  const move = (roundId: Id<"rounds">, toIndex: number) => run(() => moveRound({ roundId, toIndex }));

  return (
    <nav aria-label="Omgångar" className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted-foreground">Omgångar</h2>
      <SortableList
        items={rounds}
        getId={(round) => round._id}
        nameOf={(index) => `omgång ${index + 1}`}
        onMove={(round, _fromIndex, toIndex) => move(round._id, toIndex)}
        className="flex flex-col gap-1"
        itemClassName={(round) =>
          `flex items-center gap-1 rounded-lg border pl-1 ${round._id === selectedRoundId ? "border-primary bg-secondary" : "border-transparent bg-background"}`
        }
        renderItem={(round, { index, dragHandle }) => (
          <>
            {dragHandle}
            <button
              type="button"
              aria-current={round._id === selectedRoundId}
              onClick={() => onSelectRound(round._id)}
              className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg py-2 pr-3 pl-1 text-left"
            >
              <span className="break-words">
                {index + 1}. {round.title}
              </span>
              <span className="text-xs text-muted-foreground">{countLabel(round)}</span>
            </button>
          </>
        )}
      />
      <AddRoundForm
        onAdd={async ({ title, kind }) => {
          await run(async () => onSelectRound(await addRound({ quizId, title, kind })));
        }}
      />
    </nav>
  );
}
