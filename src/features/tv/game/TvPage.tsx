"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { useAnsweredTeamIds } from "@/features/shared/answers/useAnsweredTeamIds";
import { QuzWordmark } from "@/features/shared/brand/QuzWordmark";
import type { TvTeam } from "@/features/shared/tvScreens/TeamList";
import { TvScreen } from "@/features/shared/tvScreens/TvScreen";
import { TvStage } from "./TvStage";
import { useJoinUrl } from "@/features/shared/tvScreens/useJoinUrl";

function Idle({ text }: { text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[3cqw]">
      <QuzWordmark title="Quz" className="h-[14cqw] w-auto" />
      <p className="text-[2cqw] text-muted-foreground">{text}</p>
    </div>
  );
}

// The shared screen: shows whatever the running game is on, and needs no login, since it
// shows only what the room sees anyway.
export function TvPage() {
  return (
    <TvStage>
      <CurrentScreen />
    </TvStage>
  );
}

function CurrentScreen() {
  const game = useQuery(api.games.queries.getRunningGame);
  const teams = useQuery(api.teams.queries.listTeams, game ? { gameId: game._id } : "skip") ?? [];
  const joinUrl = useJoinUrl();

  if (game === undefined || joinUrl === null) return <Idle text="Hämtar quizet…" />;
  if (game === null) return <Idle text="Inget quiz pågår just nu." />;
  return <RunningGameScreen game={game} teams={teams} joinUrl={joinUrl} />;
}

type RunningGame = NonNullable<FunctionReturnType<typeof api.games.queries.getRunningGame>>;

function RunningGameScreen({ game, teams, joinUrl }: { game: RunningGame; teams: TvTeam[]; joinUrl: URL }) {
  const answeredTeamIds = useAnsweredTeamIds(game._id, game.screen);
  return (
    <TvScreen
      view={game.view}
      quizTitle={game.quizTitle}
      joinUrl={joinUrl}
      teams={teams}
      media={game.media}
      imageUrls={game.imageUrls}
      answeredCount={answeredTeamIds?.length ?? null}
      timer={game.timer}
      playback={game.playback}
    />
  );
}
