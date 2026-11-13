"use client";

import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import type { FilmOnScreen } from "@/features/player/answering/AnswerInputProps";
import { JoinForm } from "@/features/player/join/JoinForm";
import { useSavedTeamId } from "@/features/player/join/useSavedTeamId";
import { useScores } from "@/features/shared/scores/useScores";
import { FollowGame } from "./FollowGame";
import { NoGameRunning } from "./NoGameRunning";
import type { RunningGame } from "@/features/shared/game/RunningGame";


// The trip's film while it shows, where it is and how long it is, for the phone's live points (D63).
export function tripFilmOf(game: Pick<RunningGame, "media" | "playback">): FilmOnScreen | null {
  return game.media?.kind === "video" && game.media.showsCluePoints ? { playback: game.playback, durationSeconds: game.media.durationSeconds } : null;
}

function Waiting() {
  return <p className="p-8 text-center text-muted-foreground">Hämtar quizet…</p>;
}

function TeamInGame({ game, teamId, saveTeamId }: { game: RunningGame; teamId: string | null; saveTeamId: (id: string | null) => void }) {
  const team = useQuery(api.teams.queries.getTeam, teamId === null ? "skip" : { teamId });
  // A saved team from an earlier game, or one that is gone, can't play this one: join anew.
  const isStale = teamId !== null && team === null;
  const points = useScores(game._id, Boolean(team))?.find((score) => score._id === team?._id)?.points ?? null;
  useEffect(() => {
    if (isStale) saveTeamId(null);
  }, [isStale, saveTeamId]);

  if (teamId !== null && team === undefined) return <Waiting />;
  if (team) {
    return (
      <FollowGame
        team={team}
        points={points}
        screen={game.screen}
        view={game.view}
        imageUrls={game.imageUrls}
        timer={game.timer}
        isQuestionClosed={game.isQuestionClosed}
        film={tripFilmOf(game)}
      />
    );
  }
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
