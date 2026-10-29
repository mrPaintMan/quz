"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { LiveControl } from "./LiveControl";

// /admin/games/[gameId]: the live control while the game runs.
export function GameControl({ gameId }: { gameId: Id<"games"> }) {
  const game = useQuery(api.games.queries.getRunningGame);

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
  return <LiveControl game={game} />;
}
