import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { TvScreen } from "./TvScreen";

const renderView = (view: ScreenView) =>
  render(<TvScreen view={view} quizTitle="Julquiz 2026" joinUrl={new URL("https://quz.nu/")} teams={[]} />);

describe("TvScreen", () => {
  it.each<[ScreenView, string, string | null]>([
    [{ kind: "lobby" }, "Julquiz 2026", "Välkomna till"],
    [{ kind: "rules", roundCount: 1, questionCount: 2, activityCount: 0 }, "Så funkar kvällen", null],
    [{ kind: "roundIntro", roundNumber: 2, title: "Julmat" }, "Julmat", "Omgång 2"],
    [{ kind: "question", roundNumber: 2, questionNumber: 3, prompt: "Vilken krydda?", answeredInApp: true }, "Vilken krydda?", "Omgång 2 · Fråga 3"],
    [{ kind: "answer", roundNumber: 2, questionNumber: 3, prompt: "Vilken krydda?" }, "Vilken krydda?", "Omgång 2 · Svar på fråga 3"],
    [{ kind: "film", roundNumber: 4 }, "Film", "Omgång 4"],
    [{ kind: "leaderboard", roundNumber: 1 }, "Topplista efter omgång 1", null],
    [{ kind: "finalLeaderboard" }, "Slutresultat", null],
  ])("shows the %o screen", (view, title, eyebrow) => {
    renderView(view);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    if (eyebrow) expect(screen.getByText(eyebrow)).toBeInTheDocument();
  });
});
