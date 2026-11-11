import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Timer } from "@convex/games/timer";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { TvScreen } from "./TvScreen";

vi.mock("convex/react", () => ({ useMutation: () => vi.fn().mockResolvedValue(null) }));

type Extras = { media?: ShownMedia | null; timer?: Timer | null; answeredCount?: number | null };

const teams = [
  { _id: "t1", name: "Röda", colour: "red" as const },
  { _id: "t2", name: "Blå", colour: "blue" as const },
];

const renderView = (view: ScreenView, { media = null, timer = null, answeredCount = null }: Extras = {}) =>
  render(
    <TvScreen
      view={view}
      quizTitle="Julquiz 2026"
      joinUrl={new URL("https://quz.nu/")}
      teams={teams}
      scores={[]}
      media={media}
      imageUrls={{}}
      answeredCount={answeredCount}
      timer={timer}
      playback={null}
    />,
  );

const question: ScreenView = { kind: "question", roundNumber: 1, questionNumber: 1, prompt: "Vem är det?", answeredInApp: true, shown: null };
const answer: ScreenView = { kind: "answer", roundNumber: 1, questionNumber: 1, prompt: "Vem är det?", revealed: null };
const image: ShownMedia = { kind: "image", url: "https://example.com/tomte.jpg" };

describe("TvScreen", () => {
  it.each<[ScreenView, string, string | null]>([
    [{ kind: "lobby" }, "Julquiz 2026", "Välkomna till"],
    [{ kind: "rules", roundCount: 1, questionCount: 2, activityCount: 0 }, "Så funkar kvällen", null],
    [{ kind: "roundIntro", roundNumber: 2, title: "Julmat" }, "Julmat", "Omgång 2"],
    [{ kind: "question", roundNumber: 2, questionNumber: 3, prompt: "Vilken krydda?", answeredInApp: true, shown: null }, "Vilken krydda?", "Omgång 2 · Fråga 3"],
    [{ kind: "question", roundNumber: 2, questionNumber: 4, prompt: "Baka ett pepparkakshus", answeredInApp: false, shown: null }, "Baka ett pepparkakshus", "Omgång 2 · Aktivitet"],
    [{ kind: "answer", roundNumber: 2, questionNumber: 3, prompt: "Vilken krydda?", revealed: null }, "Vilken krydda?", "Omgång 2 · Svar på fråga 3"],
    [{ kind: "film", roundNumber: 4 }, "Film", "Omgång 4"],
    [{ kind: "leaderboard", roundNumber: 1 }, "Topplista efter omgång 1", null],
    [{ kind: "finalLeaderboard" }, "Slutresultat", null],
  ])("shows the %o screen", (view, title, eyebrow) => {
    renderView(view);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    if (eyebrow) expect(screen.getByText(eyebrow)).toBeInTheDocument();
  });

  it("centres an activity's title, unless it has a picture", () => {
    const activity: ScreenView = { ...question, answeredInApp: false };
    const { unmount } = renderView(activity);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-[7cqw]");
    unmount();
    renderView(activity, { media: image });
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveClass("text-[7cqw]");
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

  it("plays a På spåret film on its film screen", async () => {
    const film: ShownMedia = { kind: "video", screen: { kind: "rules" }, posterUrl: null, showsCluePoints: false };
    const { container } = renderView({ kind: "film", roundNumber: 4 }, { media: film });
    expect(container.querySelector("video")).toBeInTheDocument();
    await act(async () => {});
  });

  it("shows a built type's question and how many teams have answered", () => {
    const shown = { type: "multipleChoice" as const, options: [{ text: "Sverige", imageId: null }] };
    renderView({ ...question, shown } as ScreenView, { answeredCount: 1 });
    expect(screen.getByText("Sverige")).toBeInTheDocument();
    expect(screen.getByText("1 av 2 lag har svarat")).toBeInTheDocument();
  });

  it("doesn't count answers to a question not yet answered in the app", () => {
    renderView(question, { answeredCount: 0 });
    expect(screen.queryByText(/lag har svarat/)).not.toBeInTheDocument();
  });

  it("reveals a built type's answer", () => {
    const revealed = { type: "multipleChoice" as const, options: [{ text: "Sverige", imageId: null }], correctIndex: 0 };
    renderView({ ...answer, revealed } as ScreenView);
    expect(screen.getByText("Sverige")).toBeInTheDocument();
  });
});
