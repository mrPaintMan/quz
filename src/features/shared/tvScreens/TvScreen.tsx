import type { Playback } from "@convex/games/playback";
import type { Timer } from "@convex/games/timer";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { LobbyScreen } from "./LobbyScreen";
import { RulesScreen } from "./RulesScreen";
import type { TvTeam } from "./TeamList";
import { TvFrame } from "./TvFrame";
import { TvMedia } from "./TvMedia";
import { TvTimer } from "./TvTimer";

type TvScreenProps = {
  view: ScreenView;
  quizTitle: string;
  joinUrl: URL;
  teams: TvTeam[];
  media: ShownMedia | null;
  timer: Timer | null;
  playback: Playback | null;
  // Draws the screen without playing its clip, for the hosts' small copies of the TV.
  silent?: boolean;
};

const roundLabel = (roundNumber: number) => `Omgång ${roundNumber}`;

// The screen the game is on. Questions and answers show their text and media for now; each
// question type's display comes in M3 and På spåret's films after this. Drawn on the TV and,
// smaller, in the hosts' live control.
export function TvScreen({ view, quizTitle, joinUrl, teams, media, timer, playback, silent = false }: TvScreenProps) {
  const mediaArea = media && (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <TvMedia media={media} playback={playback} silent={silent} />
    </div>
  );
  switch (view.kind) {
    case "lobby":
      return <LobbyScreen quizTitle={quizTitle} joinUrl={joinUrl} teams={teams} />;
    case "rules":
      return <RulesScreen {...view} />;
    case "roundIntro":
      return <TvFrame eyebrow={roundLabel(view.roundNumber)} title={view.title} />;
    case "question":
      return (
        <TvFrame
          eyebrow={`${roundLabel(view.roundNumber)} · Fråga ${view.questionNumber}`}
          title={view.prompt}
          corner={<TvTimer timer={timer} />}
        >
          {mediaArea}
        </TvFrame>
      );
    case "answer":
      return (
        <TvFrame eyebrow={`${roundLabel(view.roundNumber)} · Svar på fråga ${view.questionNumber}`} title={view.prompt}>
          {mediaArea}
        </TvFrame>
      );
    case "film":
      return <TvFrame eyebrow={roundLabel(view.roundNumber)} title="Film" />;
    case "leaderboard":
      return <LeaderboardScreen title={`Topplista efter omgång ${view.roundNumber}`} teams={teams} />;
    case "finalLeaderboard":
      return <LeaderboardScreen title="Slutresultat" teams={teams} />;
  }
}
