import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { questionPlace } from "@/features/shared/tvScreens/questionPlace";

// A short name for a screen, for the hosts' live control.
export function screenLabel(view: ScreenView): string {
  switch (view.kind) {
    case "lobby":
      return "Lobby";
    case "rules":
      return "Regler";
    case "roundIntro":
      return `Omgång ${view.roundNumber}: ${view.title}`;
    case "question":
      return `Omgång ${view.roundNumber} · ${questionPlace(view)}`;
    case "answer":
      return `Omgång ${view.roundNumber} · Svar på fråga ${view.questionNumber}`;
    case "film":
      return `Omgång ${view.roundNumber} · Film`;
    case "leaderboard":
      return `Topplista efter omgång ${view.roundNumber}`;
    case "finalLeaderboard":
      return "Slutresultat";
  }
}
