import type { Playback } from "@convex/games/playback";
import { sendsWithBrake } from "@/domain/answering/registry";
import type { Timer } from "@convex/games/timer";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { answerPlacesMedia, RevealedAnswerDisplay, ShownQuestionDisplay } from "@/features/shared/questionDisplays/QuestionDisplay";
import { TvDecor } from "@/features/shared/julquiz/TvDecor";
import type { ImageUrls } from "@/features/shared/questionDisplays/QuestionDisplayProps";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { LobbyScreen } from "./LobbyScreen";
import { RulesScreen } from "./RulesScreen";
import type { TvTeam } from "./TeamList";
import { TvFrame } from "./TvFrame";
import { TvMedia } from "./TvMedia";
import { filmLabel, roundLabel, screenEyebrow } from "./questionPlace";
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
  // A Julquiz's screens are dressed for Christmas (D75).
  isChristmas?: boolean;
};

// Where a Julquiz screen's pine goes: a bed under its main box, drawn by the screen itself, or the
// lower corners of a screen without one; a film keeps its whole screen.
function pineOf(view: ScreenView): "bed" | "corners" | "none" {
  switch (view.kind) {
    case "lobby":
    case "leaderboard":
    case "finalLeaderboard":
      return "bed";
    case "film":
      return "none";
    default:
      return "corners";
  }
}

// The screen, with a Julquiz's decorations behind it. The wrapper stacks the decorations under the
// screen's content, and its data attribute gives the titles their Christmas font; it keeps the
// screen clear of the lights along the top and the pine along the bottom.
export function TvScreen(props: TvScreenProps) {
  const isChristmas = props.isChristmas === true;
  return (
    <div className={`relative isolate flex min-h-0 flex-1 flex-col ${isChristmas ? "pt-[3cqw] pb-[1.5cqw]" : ""}`} data-julquiz={isChristmas ? "" : undefined}>
      {isChristmas && <TvDecor corners={pineOf(props.view) === "corners"} />}
      <ScreenContent {...props} isChristmas={isChristmas} />
    </div>
  );
}


// The screen the game is on. A question shows its type's display (such as the options) once that
// type is built in M3, and how many teams have answered. Drawn on the TV and, smaller, in the
// hosts' live control.
function ScreenContent(props: TvScreenProps & { isChristmas: boolean }) {
  const { view, quizTitle, joinUrl, teams, scores, media, imageUrls, answeredCount, timer, playback, silent = false, isChristmas } = props;
  const mediaArea = media && (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <TvMedia media={media} playback={playback} silent={silent} />
    </div>
  );
  switch (view.kind) {
    case "lobby":
      return <LobbyScreen quizTitle={quizTitle} joinUrl={joinUrl} teams={teams} isChristmas={isChristmas} />;
    case "rules":
      return <RulesScreen {...view} />;
    case "roundIntro":
      return <TvFrame eyebrow={roundLabel(view.roundNumber)} title={view.title} centered />;
    case "question":
      return (
        // An activity's title stands centred, unless a picture or clip needs the room.
        <TvFrame
          eyebrow={screenEyebrow(view)}
          title={view.prompt}
          description={view.description}
          corner={<TvTimer timer={timer} />}
          centered={!view.answeredInApp && !media}
        >
          {mediaArea}
          {view.shown && <ShownQuestionDisplay shown={view.shown} imageUrls={imageUrls} />}
          {view.shown && answeredCount !== null && (
            // A trip's guess is sent by pulling the brake (D63).
            <p className="mt-auto shrink-0 text-[2cqw] text-muted-foreground">{`${answeredCount} av ${teams.length} lag har ${sendsWithBrake(view.shown.type) ? "bromsat" : "svarat"}`}</p>
          )}
        </TvFrame>
      );
    case "answer": {
      const placesMedia = view.revealed !== null && answerPlacesMedia(view.revealed.type);
      return (
        <TvFrame eyebrow={screenEyebrow(view)} title={view.prompt} description={view.description}>
          {/* A type that places the picture itself, such as beside a map, gets it there instead (D66). */}
          {!placesMedia && mediaArea}
          {view.revealed && (
            <RevealedAnswerDisplay
              revealed={view.revealed}
              imageUrls={imageUrls}
              media={placesMedia && media ? <TvMedia media={media} playback={playback} silent={silent} /> : undefined}
            />
          )}
        </TvFrame>
      );
    }
    case "film":
      return (
        // No heading of its own, so the film has the room; only its small line (D74).
        <TvFrame eyebrow={filmLabel(view.filmNumber)} titleCentered>
          {mediaArea}
        </TvFrame>
      );
    case "leaderboard":
      return <LeaderboardScreen title={`Topplista efter omgång ${view.roundNumber}`} scores={scores} isChristmas={isChristmas} />;
    case "finalLeaderboard":
      return <LeaderboardScreen title="Slutresultat" scores={scores} isChristmas={isChristmas} />;
  }
}
