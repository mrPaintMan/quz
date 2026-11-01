"use client";

import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Ends the night for the TV and every phone, then goes back to the quizzes.
export function EndGameButton({ gameId }: { gameId: Id<"games"> }) {
  const router = useRouter();
  const endGame = useHostMutation(api.games.mutations.endGame);
  const run = useRunAction();
  return (
    <ConfirmButton
      variant="outline"
      title="Avsluta quizet?"
      description="TV:n och mobilerna visar att quizet är slut. Det går inte att fortsätta efteråt."
      confirmLabel="Avsluta"
      onConfirm={() => run(async () => {
        await endGame({ gameId });
        router.push("/admin");
      })}
    >
      Avsluta quiz
    </ConfirmButton>
  );
}
