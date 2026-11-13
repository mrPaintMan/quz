import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { Playback } from "@convex/games/playback";
import type { Screen } from "@convex/games/screen";
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
const review = vi.fn();
const handPoints = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({
  useHostQuery: (query: FunctionReference<"query">, args: unknown) => {
    if (args === "skip") return undefined;
    const name = getFunctionName(query);
    if (name.endsWith("getReview")) return review();
    return name.endsWith("getHandPoints") ? handPoints() : nextScreen();
  },
}));
vi.mock("./TripClueLine", () => ({ TripClueLine: () => <p>Ledtrådsrad</p> }));
vi.mock("./HandScoring", () => ({ HandScoring: ({ questionId, title }: { questionId: string; title: string }) => <p>{`${title} ${questionId}`}</p> }));
vi.mock("./Corrections", () => ({ Corrections: () => <p>Rätta poäng</p> }));
vi.mock("./ReviewList", () => ({ ReviewList: ({ questionId }: { questionId: string }) => <p>Granskning av {questionId}</p> }));
vi.mock("@/features/shared/answers/useAnsweredTeamIds", () => ({ useAnsweredTeamIds: () => ["t1"] }));
const scores = vi.fn();
vi.mock("@/features/shared/scores/useScores", () => ({ useScores: () => scores() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({
  // The generated api hands out a new reference on each access, so pick by name.
  useHostMutation: (mutation: FunctionReference<"mutation">) =>
    mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations] ?? vi.fn(),
}));

const gameId = "game1" as Id<"games">;
const reviewItem = (isJudged: boolean) => ({ slot: 0, text: "x", written: "x", teamCount: 1, isJudged, target: null, byAi: false });
const rulesNext = { view: { kind: "rules", roundCount: 1, questionCount: 1, activityCount: 0 }, media: null, notes: { current: null, next: null } };
const question: ScreenView = { kind: "question", roundNumber: 1, questionNumber: 2, prompt: "Vilken krydda?", answeredInApp: true, shown: null };

type GameState = { screenNow?: Screen; view?: ScreenView; media?: ShownMedia | null; timer?: Timer | null; playback?: Playback | null };

function renderControl({ screenNow = { kind: "lobby" }, view = { kind: "lobby" }, media = null, timer = null, playback = null }: GameState = {}) {
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
    scores.mockReturnValue([]);
    nextScreen.mockReturnValue(rulesNext);
    review.mockReturnValue(null);
    handPoints.mockReturnValue({ maxPoints: 5, teams: [] });
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  it("shows what the TV shows now, drawn as on the TV", () => {
    renderControl();
    expect(screen.getByRole("status")).toHaveTextContent("Lobby");
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
  });

  it("shows the review list once a question's answers lock, on its question or answer screen", () => {
    const questionId = "q1" as Id<"questions">;
    review.mockReturnValue({ slots: [], items: [], unjudged: 0, aiStatus: null, phase: "settled" });
    renderControl({ screenNow: { kind: "answer", questionId }, view: { kind: "answer", roundNumber: 1, questionNumber: 2, prompt: "Vilken krydda?", revealed: null } });
    expect(screen.getByText("Granskning av q1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nästa" })).toBeEnabled();
  });

  it("makes Nästa wait while the AI judges, and until every text is judged", () => {
    const questionId = "q1" as Id<"questions">;
    review.mockReturnValue({ slots: [], items: [reviewItem(false)], unjudged: 1, aiStatus: "judging", phase: "judging" });
    renderControl({ screenNow: { kind: "question", questionId }, view: question });
    expect(screen.getByText("Nästa väntar på AI:n…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nästa" })).toBeDisabled();
  });

  it("keeps Nästa disabled until the question's judging state has loaded", () => {
    review.mockReturnValue(undefined);
    renderControl({ screenNow: { kind: "question", questionId: "q1" as Id<"questions"> }, view: question });
    expect(screen.getByRole("button", { name: "Nästa" })).toBeDisabled();
  });

  it("says how many texts are left to judge before Nästa", () => {
    const questionId = "q1" as Id<"questions">;
    review.mockReturnValue({ slots: [], items: [reviewItem(false), reviewItem(false), reviewItem(true)], unjudged: 2, aiStatus: "done", phase: "reviewing" });
    renderControl({ screenNow: { kind: "answer", questionId }, view: { kind: "answer", roundNumber: 1, questionNumber: 2, prompt: "?", revealed: null } });
    expect(screen.getByText("Nästa väntar tills alla svar är bedömda (2 kvar).")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nästa" })).toBeDisabled();
  });

  it("shows no review list on other screens", () => {
    renderControl();
    expect(screen.queryByText(/Granskning av/)).not.toBeInTheDocument();
  });

  it("shows what comes next", () => {
    renderControl();
    expect(screen.getByText("Regler")).toBeInTheDocument();
    expect(screen.getByText("Så funkar kvällen")).toBeInTheDocument();
  });

  it("says when nothing comes after, and offers to end the quiz instead of Nästa", () => {
    nextScreen.mockReturnValue(null);
    renderControl();
    expect(screen.getByText("Inget mer efter detta.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nästa" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Avsluta quiz" })).toHaveLength(2);
  });

  it("shows the next screen's notes, and the notes of the question on the TV folded away", () => {
    nextScreen.mockReturnValue({
      ...rulesNext,
      notes: {
        current: { questionId: "q1", notes: "Manus för fråga 1", scoring: { kind: "Närmast vinner", rules: ["Plats 1: 3 p"] } },
        next: { questionId: "q2", notes: "Manus för fråga 2", scoring: null },
      },
    });
    renderControl({ view: question });
    expect(screen.getByText("Manus för fråga 2")).toBeVisible();
    expect(screen.getByText("Manus för fråga 1")).not.toBeVisible();
    expect(screen.getByRole("heading", { name: "Poängsättning: Närmast vinner" })).toBeInTheDocument();
  });

  it("doesn't repeat the notes of a question moving on to its own answer", () => {
    nextScreen.mockReturnValue({ ...rulesNext, notes: { current: { questionId: "q1", notes: "Manus", scoring: null }, next: { questionId: "q1", notes: "Manus", scoring: null } } });
    renderControl({ view: question });
    expect(screen.getAllByText("Manus")).toHaveLength(1);
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

  it("lets the hosts give points on an activity's screen, and only there", () => {
    renderControl({ screenNow: { kind: "question", questionId: "q1" as Id<"questions"> }, view: { ...question, answeredInApp: false } });
    expect(screen.getByText("Poäng för aktiviteten q1")).toBeInTheDocument();
    expect(screen.getByText("Rätta poäng")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nästa" })).toBeEnabled();
  });

  it("gives no points by hand on a question answered in the app", () => {
    renderControl({ screenNow: { kind: "question", questionId: "q1" as Id<"questions"> }, view: question });
    expect(screen.queryByText(/Poäng för/)).not.toBeInTheDocument();
  });

  it("lets the hosts score the drawings on their answer screen, Nästa waiting until each has points", () => {
    const drawingAnswer: ScreenView = { kind: "answer", roundNumber: 1, questionNumber: 2, prompt: "Rita en tomte", revealed: { type: "drawing", drawings: [] } };
    handPoints.mockReturnValue({ maxPoints: 3, teams: [{ teamId: "t1", points: 2 }, { teamId: "t2", points: null }] });
    renderControl({ screenNow: { kind: "answer", questionId: "q1" as Id<"questions"> }, view: drawingAnswer });
    expect(screen.getByText("Poäng för teckningarna q1")).toBeInTheDocument();
    expect(screen.getByText("Nästa väntar tills alla teckningar har poäng (1 kvar).")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nästa" })).toBeDisabled();
  });

  it("keeps Nästa disabled until the drawings' points have loaded", () => {
    const drawingAnswer: ScreenView = { kind: "answer", roundNumber: 1, questionNumber: 2, prompt: "Rita en tomte", revealed: { type: "drawing", drawings: [] } };
    handPoints.mockReturnValue(undefined);
    renderControl({ screenNow: { kind: "answer", questionId: "q1" as Id<"questions"> }, view: drawingAnswer });
    expect(screen.getByRole("button", { name: "Nästa" })).toBeDisabled();
  });

  it("shows the leaderboard as it stands", () => {
    scores.mockReturnValue([{ _id: "t1", name: "Tomtarna", colour: "red", points: 4, rank: 1 }]);
    renderControl();
    expect(screen.getByRole("heading", { name: "Topplista" })).toBeInTheDocument();
    expect(screen.getByText("4 p")).toBeInTheDocument();
  });

  it("links to the TV view", () => {
    renderControl();
    expect(screen.getByRole("link", { name: "Öppna TV-vyn" })).toHaveAttribute("href", "/tv");
  });
});
