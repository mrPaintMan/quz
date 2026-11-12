import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { HandScoring, type HandScoringState } from "./HandScoring";

const setHandPoints = vi.fn();
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => setHandPoints }));

const gameId = "game1" as Id<"games">;
const questionId = "q1" as Id<"questions">;
const red = "red1" as Id<"teams">;
const blue = "blue1" as Id<"teams">;
const teams = [
  { _id: red, name: "Tomtarna", colour: "red" as const },
  { _id: blue, name: "Renarna", colour: "blue" as const },
];

// Both teams, Tomtarna with 2,5 p so far, unless given otherwise.
const scoringOf = (maxPoints: number | null, redPoints: number | null = 2.5): HandScoringState => ({
  maxPoints,
  teams: [
    { teamId: red, points: redPoints },
    { teamId: blue, points: null },
  ],
});

const renderScoring = (scoring = scoringOf(5)) =>
  render(
    <ActionErrorProvider>
      <HandScoring gameId={gameId} questionId={questionId} title="Poäng för aktiviteten" scoring={scoring} teams={teams} />
    </ActionErrorProvider>,
  );
const sent = () => setHandPoints.mock.calls.map(([args]) => [args.teamId, args.points]);

describe("HandScoring", () => {
  beforeEach(() => {
    setHandPoints.mockReset().mockResolvedValue(null);
  });

  it("shows each team's points so far and the question's most", () => {
    renderScoring();
    expect(screen.getByRole("heading", { name: "Poäng för aktiviteten" })).toBeInTheDocument();
    expect(screen.getByText("Högst 5 p per lag.")).toBeInTheDocument();
    expect(screen.getByLabelText("Poäng för Tomtarna")).toHaveValue("2,5");
    expect(screen.getByLabelText("Poäng för Renarna")).toHaveValue("");
  });

  it("steps a whole point with − and +, within 0 and the most", async () => {
    renderScoring(scoringOf(5, 4.5));
    await userEvent.click(screen.getByRole("button", { name: "Plus för Tomtarna" }));
    await userEvent.click(screen.getByRole("button", { name: "Minus för Tomtarna" }));
    await userEvent.click(screen.getByRole("button", { name: "Plus för Renarna" }));
    expect(sent()).toEqual([
      [red, 5],
      [red, 3.5],
      [blue, 1],
    ]);
    expect(screen.getByRole("button", { name: "Minus för Renarna" })).toBeDisabled();
  });

  it("stops + at the most", () => {
    renderScoring(scoringOf(5, 5));
    expect(screen.getByRole("button", { name: "Plus för Tomtarna" })).toBeDisabled();
  });

  it("sends typed points once the field is left or Enter is pressed, and clears them when emptied", async () => {
    renderScoring();
    await userEvent.type(screen.getByLabelText("Poäng för Renarna"), "3,5");
    expect(setHandPoints).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    await userEvent.clear(screen.getByLabelText("Poäng för Tomtarna"));
    await userEvent.tab();
    expect(sent()).toEqual([
      [blue, 3.5],
      [red, null],
    ]);
  });

  it("holds back points past the most, and sends nothing when they didn't change", async () => {
    renderScoring();
    const field = screen.getByLabelText("Poäng för Renarna");
    await userEvent.type(field, "9");
    await userEvent.tab();
    expect(field).toHaveAttribute("aria-invalid", "true");
    await userEvent.click(screen.getByLabelText("Poäng för Tomtarna"));
    await userEvent.tab();
    expect(setHandPoints).not.toHaveBeenCalled();
  });

  it("has no cap when the activity has no most", async () => {
    renderScoring(scoringOf(null, 40));
    expect(screen.queryByText(/Högst/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Plus för Tomtarna" }));
    expect(sent()).toEqual([[red, 41]]);
  });

  it("lists only the teams it scores, and says when there are none", () => {
    const { unmount } = renderScoring({ maxPoints: 5, teams: [{ teamId: blue, points: null }] });
    expect(screen.queryByLabelText("Poäng för Tomtarna")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Poäng för Renarna")).toBeInTheDocument();
    unmount();
    renderScoring({ maxPoints: 5, teams: [] });
    expect(screen.getByText("Inga svar.")).toBeInTheDocument();
  });
});
