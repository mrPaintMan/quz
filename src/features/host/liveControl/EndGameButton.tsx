"use client";

import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { useHostMutation } from "@/features/host/shared/useHostMutation";

// Ends the night for the TV and every phone, then goes back to the quizzes. In the header, and in
// Nästa's place once the last screen shows.
export function EndGameButton({ gameId, size, variant = "outline" }: { gameId: Id<"games">; size?: "lg"; variant?: "outline" | "default" }) {
  const router = useRouter();
  const endGame = useHostMutation(api.games.mutations.endGame);
  const run = useRunAction();
  return (
    <ConfirmButton
      variant={variant}
      size={size}
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
