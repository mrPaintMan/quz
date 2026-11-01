import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Timer } from "@convex/games/timer";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { TvScreen } from "./TvScreen";

type Extras = { media?: ShownMedia | null; timer?: Timer | null };

const renderView = (view: ScreenView, { media = null, timer = null }: Extras = {}) =>
  render(
    <TvScreen view={view} quizTitle="Julquiz 2026" joinUrl={new URL("https://quz.nu/")} teams={[]} media={media} timer={timer} playback={null} />,
  );

const question: ScreenView = { kind: "question", roundNumber: 1, questionNumber: 1, prompt: "Vem är det?", answeredInApp: true };
const answer: ScreenView = { kind: "answer", roundNumber: 1, questionNumber: 1, prompt: "Vem är det?" };
const image: ShownMedia = { kind: "image", url: "https://example.com/tomte.jpg" };

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

  it("shows the question's timer", () => {
    renderView(question, { timer: { kind: "paused", remainingMs: 42_000 } });
    expect(screen.getByRole("timer")).toHaveTextContent("0:42");
  });

  it.each([question, answer])("shows the picture on the %o screen", (view) => {
    renderView(view, { media: image });
    expect(screen.getByRole("presentation")).toHaveAttribute("src", image.url);
  });

  it("shows no media area without media", () => {
    renderView(question);
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });
});
