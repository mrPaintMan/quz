"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { JoinForm } from "@/features/player/join/JoinForm";
import { useSavedTeamId } from "@/features/player/join/useSavedTeamId";
import { FollowGame } from "./FollowGame";
import { NoGameRunning } from "./NoGameRunning";

type RunningGame = NonNullable<FunctionReturnType<typeof api.games.queries.getRunningGame>>;

function Waiting() {
  return <p className="p-8 text-center text-muted-foreground">Hämtar quizet…</p>;
}

function TeamInGame({ game, teamId, saveTeamId }: { game: RunningGame; teamId: string | null; saveTeamId: (id: string | null) => void }) {
  const team = useQuery(api.teams.queries.getTeam, teamId === null ? "skip" : { teamId });
  // A saved team from an earlier game, or one that is gone, can't play this one: join anew.
  const isStale = teamId !== null && team === null;
  useEffect(() => {
    if (isStale) saveTeamId(null);
  }, [isStale, saveTeamId]);

  if (teamId !== null && team === undefined) return <Waiting />;
  if (team) return <FollowGame team={team} view={game.view} />;
  return (
    <main className="flex min-h-svh items-center justify-center p-5">
      <JoinForm gameId={game._id} quizTitle={game.quizTitle} onJoined={saveTeamId} />
    </main>
  );
}

// quz.nu: join the running game, or follow it as the team this phone joined as.
export function PlayerPage() {
  const game = useQuery(api.games.queries.getRunningGame);
  const [teamId, saveTeamId] = useSavedTeamId();

  if (game === undefined || teamId === undefined) return <Waiting />;
  if (game === null) {
    return <NoGameRunning message={teamId === null ? "Inget quiz pågår just nu." : "Quizet är slut. Tack för i kväll!"} />;
  }
  return <TeamInGame game={game} teamId={teamId} saveTeamId={saveTeamId} />;
}
