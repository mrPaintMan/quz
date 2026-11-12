import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { ActivityScoring } from "./ActivityScoring";

const activity = vi.fn();
const setActivityPoints = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => activity() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => setActivityPoints }));

const gameId = "game1" as Id<"games">;
const questionId = "q1" as Id<"questions">;
const red = "red1" as Id<"teams">;
const blue = "blue1" as Id<"teams">;
const teams = [
  { _id: red, name: "Tomtarna", colour: "red" as const },
  { _id: blue, name: "Renarna", colour: "blue" as const },
];

const renderScoring = () =>
  render(
    <ActionErrorProvider>
      <ActivityScoring gameId={gameId} questionId={questionId} teams={teams} />
    </ActionErrorProvider>,
  );
const sent = () => setActivityPoints.mock.calls.map(([args]) => [args.teamId, args.points]);

describe("ActivityScoring", () => {
  beforeEach(() => {
    setActivityPoints.mockReset().mockResolvedValue(null);
    activity.mockReturnValue({ maxPoints: 5, teams: [{ teamId: red, points: 2.5 }] });
  });

  it("shows each team's points so far and the activity's most", () => {
    renderScoring();
    expect(screen.getByText("Högst 5 p per lag.")).toBeInTheDocument();
    expect(screen.getByLabelText("Poäng för Tomtarna")).toHaveValue("2,5");
    expect(screen.getByLabelText("Poäng för Renarna")).toHaveValue("");
  });

  it("steps a whole point with − and +, within 0 and the most", async () => {
    activity.mockReturnValue({ maxPoints: 5, teams: [{ teamId: red, points: 4.5 }] });
    renderScoring();
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
    activity.mockReturnValue({ maxPoints: 5, teams: [{ teamId: red, points: 5 }] });
    renderScoring();
    expect(screen.getByRole("button", { name: "Plus för Tomtarna" })).toBeDisabled();
  });

  it("sends typed points once the field is left or Enter is pressed, and clears them when emptied", async () => {
    renderScoring();
    await userEvent.type(screen.getByLabelText("Poäng för Renarna"), "3,5");
    expect(setActivityPoints).not.toHaveBeenCalled();
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
    expect(setActivityPoints).not.toHaveBeenCalled();
  });

  it("has no cap when the activity has no most", async () => {
    activity.mockReturnValue({ maxPoints: null, teams: [{ teamId: red, points: 40 }] });
    renderScoring();
    expect(screen.queryByText(/Högst/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Plus för Tomtarna" }));
    expect(sent()).toEqual([[red, 41]]);
  });

  it("shows nothing until loaded, or for a question that isn't an activity", () => {
    activity.mockReturnValue(null);
    const { container } = renderScoring();
    expect(container).toBeEmptyDOMElement();
  });
});
