"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Starts the night and opens its live control. Only one game runs at a time, so starting
// while another runs asks first, since that ends it (D34).
export function StartGameButton({ quizId, disabled }: { quizId: Id<"quizzes">; disabled: boolean }) {
  const router = useRouter();
  const runningGame = useQuery(api.games.queries.getRunningGame);
  const startGame = useHostMutation(api.games.mutations.startGame);
  const run = useRunAction();
  const start = () => run(async () => router.push(`/admin/games/${await startGame({ quizId })}`));

  if (disabled || !runningGame) {
    return (
      <Button disabled={disabled} onClick={start}>
        Starta quiz
      </Button>
    );
  }
  return (
    <ConfirmButton
      variant="default"
      title="Ett quiz pågår redan"
      description={`”${runningGame.quizTitle}” pågår just nu. Startar du det här quizet avslutas det.`}
      confirmLabel="Avsluta och starta"
      onConfirm={start}
    >
      Starta quiz
    </ConfirmButton>
  );
}
