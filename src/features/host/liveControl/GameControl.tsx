"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useRunAction } from "@/features/host/shared/ActionErrorProvider";
import { ConfirmButton } from "@/features/host/shared/ConfirmButton";
import { HostHeader } from "@/features/host/shared/HostHeader";
import { useHostMutation } from "@/features/host/shared/useHostMutation";
import { screenLabel } from "./screenLabel";

// The live control during the night: for now only stepping through the screens and ending the
// game; the timer, media and the TV preview come with the full live view.
export function GameControl({ gameId }: { gameId: Id<"games"> }) {
  const router = useRouter();
  const game = useQuery(api.games.queries.getRunningGame);
  const goToNext = useHostMutation(api.games.mutations.goToNextScreen);
  const goToPrevious = useHostMutation(api.games.mutations.goToPreviousScreen);
  const endGame = useHostMutation(api.games.mutations.endGame);
  const run = useRunAction();

  if (game === undefined) return <p className="p-8 text-center text-muted-foreground">Hämtar quizet…</p>;
  if (game?._id !== gameId) {
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <p>Quizet är slut.</p>
        <Link href="/admin" className="text-primary hover:underline">
          Till dina quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <HostHeader
        actions={
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
        }
      >
        <h1 className="text-lg font-semibold">{game.quizTitle}</h1>
        <a href="/tv" target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
          Öppna TV-vyn
        </a>
      </HostHeader>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <section className="flex flex-col gap-1 rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Visas på TV:n nu</p>
          <p role="status" className="text-2xl font-semibold">
            {screenLabel(game.view)}
          </p>
        </section>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="lg" onClick={() => run(() => goToPrevious({ gameId, from: game.screen }))}>
            Föregående
          </Button>
          <Button size="lg" onClick={() => run(() => goToNext({ gameId, from: game.screen }))}>
            Nästa
          </Button>
        </div>
      </main>
    </div>
  );
}
