import type { Playback } from "@convex/games/playback";
import type { Timer } from "@convex/games/timer";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { RevealedAnswerDisplay, ShownQuestionDisplay } from "@/features/shared/questionDisplays/QuestionDisplay";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { LobbyScreen } from "./LobbyScreen";
import { RulesScreen } from "./RulesScreen";
import type { TvTeam } from "./TeamList";
import { TvFrame } from "./TvFrame";
import { TvMedia } from "./TvMedia";
import { questionPlace } from "./questionPlace";
import { TvTimer } from "./TvTimer";

type TvScreenProps = {
  view: ScreenView;
  quizTitle: string;
  joinUrl: URL;
  teams: TvTeam[];
  // The teams by score, for the leaderboards; undefined while loading.
  scores: TeamScore[] | undefined;
  media: ShownMedia | null;
  imageUrls: ImageUrls;
  // How many teams have sent their answer to the question showing; null when not counted.
  answeredCount: number | null;
  timer: Timer | null;
  playback: Playback | null;
  // Draws the screen without playing its clip, for the hosts' small copies of the TV.
  silent?: boolean;
};

const roundLabel = (roundNumber: number) => `Omgång ${roundNumber}`;

// The screen the game is on. A question shows its type's display (such as the options) once that
// type is built in M3, and how many teams have answered. Drawn on the TV and, smaller, in the
// hosts' live control.
export function TvScreen(props: TvScreenProps) {
  const { view, quizTitle, joinUrl, teams, scores, media, imageUrls, answeredCount, timer, playback, silent = false } = props;
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
      return <TvFrame eyebrow={roundLabel(view.roundNumber)} title={view.title} centered />;
    case "question":
      return (
        // An activity's title stands centred, unless a picture or clip needs the room.
        <TvFrame
          eyebrow={`${roundLabel(view.roundNumber)} · ${questionPlace(view)}`}
          title={view.prompt}
          corner={<TvTimer timer={timer} />}
          centered={!view.answeredInApp && !media}
        >
          {mediaArea}
          {view.shown && <ShownQuestionDisplay shown={view.shown} imageUrls={imageUrls} />}
          {view.shown && answeredCount !== null && (
            <p className="text-[2cqw] text-muted-foreground">{`${answeredCount} av ${teams.length} lag har svarat`}</p>
          )}
        </TvFrame>
      );
    case "answer":
      return (
        <TvFrame eyebrow={`${roundLabel(view.roundNumber)} · Svar på fråga ${view.questionNumber}`} title={view.prompt}>
          {mediaArea}
          {view.revealed && <RevealedAnswerDisplay revealed={view.revealed} imageUrls={imageUrls} />}
        </TvFrame>
      );
    case "film":
      return (
        <TvFrame eyebrow={roundLabel(view.roundNumber)} title="Film">
          {mediaArea}
        </TvFrame>
      );
    case "leaderboard":
      return <LeaderboardScreen title={`Topplista efter omgång ${view.roundNumber}`} scores={scores} />;
    case "finalLeaderboard":
      return <LeaderboardScreen title="Slutresultat" scores={scores} />;
  }
}
