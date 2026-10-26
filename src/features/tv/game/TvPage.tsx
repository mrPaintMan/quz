"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { QuzWordmark } from "@/features/shared/brand/QuzWordmark";
import { TvScreen } from "@/features/tv/screens/TvScreen";
import { useJoinUrl } from "./useJoinUrl";

function Idle({ text }: { text: string }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-[3vw]">
      <QuzWordmark title="Quz" className="h-[14vw] w-auto" />
      <p className="text-[2vw] text-muted-foreground">{text}</p>
    </main>
  );
}

// The shared screen: shows whatever the running game is on, and needs no login, since it
// shows only what the room sees anyway.
export function TvPage() {
  const game = useQuery(api.games.queries.getRunningGame);
  const teams = useQuery(api.teams.queries.listTeams, game ? { gameId: game._id } : "skip") ?? [];
  const joinUrl = useJoinUrl();

  if (game === undefined || joinUrl === null) return <Idle text="Hämtar quizet…" />;
  if (game === null) return <Idle text="Inget quiz pågår just nu." />;
  return <TvScreen view={game.view} quizTitle={game.quizTitle} joinUrl={joinUrl} teams={teams} />;
}
