import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { Playback } from "@convex/games/playback";
import type { Timer } from "@convex/games/timer";
import type { ShownMedia } from "@convex/media/linkScreenMedia";
import type { ScreenView } from "@/domain/screenSequence/describeScreen";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { HostSessionProvider } from "@/features/host/shared/HostSessionProvider";
import { LiveControl } from "./LiveControl";

const nextScreen = vi.fn();
const mutations = { goToNextScreen: vi.fn(), goToPreviousScreen: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("convex/react", () => ({ useQuery: () => [{ _id: "t1", name: "Tomtarna", colour: "red" }] }));
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => nextScreen() }));
vi.mock("./TripClueLine", () => ({ TripClueLine: () => <p>Ledtrådsrad</p> }));
vi.mock("@/features/shared/answers/useAnsweredTeamIds", () => ({ useAnsweredTeamIds: () => ["t1"] }));
vi.mock("@/features/host/shared/useHostMutation", () => ({
  // The generated api hands out a new reference on each access, so pick by name.
  useHostMutation: (mutation: FunctionReference<"mutation">) =>
    mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations] ?? vi.fn(),
}));

const gameId = "game1" as Id<"games">;
const question: ScreenView = { kind: "question", roundNumber: 1, questionNumber: 2, prompt: "Vilken krydda?", answeredInApp: true, shown: null };

type GameState = { view?: ScreenView; media?: ShownMedia | null; timer?: Timer | null; playback?: Playback | null };

function renderControl({ view = { kind: "lobby" }, media = null, timer = null, playback = null }: GameState = {}) {
  const screenNow = { kind: "lobby" as const };
  const game = { _id: gameId, quizId: "quiz1" as Id<"quizzes">, quizTitle: "Julquiz 2026", screen: screenNow, view, media, imageUrls: {}, timer, playback, isQuestionClosed: false };
  render(
    <HostSessionProvider session={{ passphrase: "p", logOut: vi.fn() }}>
      <ActionErrorProvider>
        <LiveControl game={game} />
      </ActionErrorProvider>
    </HostSessionProvider>,
  );
}

describe("LiveControl", () => {
  beforeEach(() => {
    nextScreen.mockReturnValue({ view: { kind: "rules", roundCount: 1, questionCount: 1, activityCount: 0 }, media: null });
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  it("shows what the TV shows now, drawn as on the TV", () => {
    renderControl();
    expect(screen.getByRole("status")).toHaveTextContent("Lobby");
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
  });

  it("shows what comes next", () => {
    renderControl();
    expect(screen.getByText("Regler")).toBeInTheDocument();
    expect(screen.getByText("Så funkar kvällen")).toBeInTheDocument();
  });

  it("says when nothing comes after", () => {
    nextScreen.mockReturnValue(null);
    renderControl();
    expect(screen.getByText("Inget mer efter detta.")).toBeInTheDocument();
  });

  it("steps from the screen showing now", async () => {
    renderControl();
    await userEvent.click(screen.getByRole("button", { name: "Nästa" }));
    expect(mutations.goToNextScreen).toHaveBeenCalledWith({ gameId, from: { kind: "lobby" } });
    await userEvent.click(screen.getByRole("button", { name: "Föregående" }));
    expect(mutations.goToPreviousScreen).toHaveBeenCalledWith({ gameId, from: { kind: "lobby" } });
  });

  it("shows the timer controls only while the question has a timer", () => {
    renderControl({ view: question, timer: { kind: "paused", remainingMs: 42_000 } });
    expect(screen.getByRole("button", { name: "Fortsätt" })).toBeInTheDocument();
    expect(screen.getAllByText("0:42")).toHaveLength(2);
  });

  it("has no timer controls without a timer", () => {
    renderControl({ view: question });
    expect(screen.queryByRole("button", { name: "Pausa" })).not.toBeInTheDocument();
  });

  it("shows the clip controls only while the question has a clip", () => {
    renderControl({ view: question, playback: { kind: "paused", positionMs: 0 } });
    expect(screen.getByRole("button", { name: "Spela" })).toBeInTheDocument();
  });

  it("has no clip controls without a clip", () => {
    renderControl({ view: question });
    expect(screen.queryByRole("button", { name: "Spela" })).not.toBeInTheDocument();
  });

  it("follows the trip's clues while its film shows", () => {
    const tripFilm: ShownMedia = { kind: "video", screen: { kind: "rules" }, posterUrl: null, showsCluePoints: true };
    renderControl({ view: question, media: tripFilm, playback: { kind: "paused", positionMs: 0 } });
    expect(screen.getByText("Ledtrådsrad")).toBeInTheDocument();
  });

  it("follows no clues over other films", () => {
    const film: ShownMedia = { kind: "video", screen: { kind: "rules" }, posterUrl: null, showsCluePoints: false };
    renderControl({ view: question, media: film, playback: { kind: "paused", positionMs: 0 } });
    expect(screen.queryByText("Ledtrådsrad")).not.toBeInTheDocument();
  });

  it("shows which teams have answered a question answered in the app", () => {
    const shown = { type: "multipleChoice" as const, options: [{ text: "Sverige", imageId: null }] };
    renderControl({ view: { ...question, shown } });
    expect(screen.getByText("Svarat")).toBeInTheDocument();
  });

  it("lists no answers for a question not yet answered in the app", () => {
    renderControl({ view: question });
    expect(screen.queryByText("Svarat")).not.toBeInTheDocument();
  });

  it("links to the TV view", () => {
    renderControl();
    expect(screen.getByRole("link", { name: "Öppna TV-vyn" })).toHaveAttribute("href", "/tv");
  });
});
