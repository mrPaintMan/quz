import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { LobbyScreen } from "./LobbyScreen";
import { RulesScreen } from "./RulesScreen";
import type { TvTeam } from "./TeamList";
import { TvFrame } from "./TvFrame";

type TvScreenProps = { view: ScreenView; quizTitle: string; joinUrl: URL; teams: TvTeam[] };

const roundLabel = (roundNumber: number) => `Omgång ${roundNumber}`;

// The screen the game is on. Questions, answers and films show their text only for now; each
// question type's display comes in M3 and film playback with the live control.
export function TvScreen({ view, quizTitle, joinUrl, teams }: TvScreenProps) {
  switch (view.kind) {
    case "lobby":
      return <LobbyScreen quizTitle={quizTitle} joinUrl={joinUrl} teams={teams} />;
    case "rules":
      return <RulesScreen {...view} />;
    case "roundIntro":
      return <TvFrame eyebrow={roundLabel(view.roundNumber)} title={view.title} />;
    case "question":
      return <TvFrame eyebrow={`${roundLabel(view.roundNumber)} · Fråga ${view.questionNumber}`} title={view.prompt} />;
    case "answer":
      return <TvFrame eyebrow={`${roundLabel(view.roundNumber)} · Svar på fråga ${view.questionNumber}`} title={view.prompt} />;
    case "film":
      return <TvFrame eyebrow={roundLabel(view.roundNumber)} title="Film" />;
    case "leaderboard":
      return <LeaderboardScreen title={`Topplista efter omgång ${view.roundNumber}`} teams={teams} />;
    case "finalLeaderboard":
      return <LeaderboardScreen title="Slutresultat" teams={teams} />;
  }
}
