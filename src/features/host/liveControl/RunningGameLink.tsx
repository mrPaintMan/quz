"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@convex/_generated/api";

// The way back to the live control from the quiz list, while a game runs.
export function RunningGameLink() {
  const game = useQuery(api.games.queries.getRunningGame);
  if (!game) return null;
  return (
    <Link href={`/admin/games/${game._id}`} className="text-sm font-medium text-primary hover:underline">
      Pågår: {game.quizTitle} →
    </Link>
  );
}
