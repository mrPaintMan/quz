import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { TripClueLine } from "./TripClueLine";

const trip = vi.fn();
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => trip() }));

const gameId = "game1" as Id<"games">;
const clues = ["Fjord", "Kung", "Vasaloppet", "Munch", "Karl Johan"];

describe("TripClueLine", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(100_000);
    trip.mockReturnValue({ clues, durationSeconds: 120 });
  });

  afterEach(() => vi.useRealTimers());

  it("shows the active clue, its points and the time to the next", () => {
    render(<TripClueLine gameId={gameId} playback={{ kind: "playing", startedAt: 70_000 }} />);
    expect(screen.getByText("Ledtråd 2 av 5 · 8 poäng · nästa om 0:18")).toBeInTheDocument();
    expect(screen.getByText("Kung")).toBeInTheDocument();
  });

  it("stands at the first clue before the film plays", () => {
    render(<TripClueLine gameId={gameId} playback={{ kind: "paused", positionMs: 0 }} />);
    expect(screen.getByText("Ledtråd 1 av 5 · 10 poäng · nästa om 0:24")).toBeInTheDocument();
  });

  it("says when the last clue is showing", () => {
    render(<TripClueLine gameId={gameId} playback={{ kind: "paused", positionMs: 100_000 }} />);
    expect(screen.getByText("Ledtråd 5 av 5 · 2 poäng · sista ledtråden")).toBeInTheDocument();
  });

  it("says when the film has ended", () => {
    render(<TripClueLine gameId={gameId} playback={{ kind: "paused", positionMs: 130_000 }} />);
    expect(screen.getByText("Filmen är slut.")).toBeInTheDocument();
  });

  it("says when the film's length is unknown", () => {
    trip.mockReturnValue({ clues, durationSeconds: null });
    render(<TripClueLine gameId={gameId} playback={{ kind: "paused", positionMs: 0 }} />);
    expect(screen.getByText("Filmens längd är okänd, så ledtrådarna kan inte följas.")).toBeInTheDocument();
  });

  it("shows nothing until the trip has loaded", () => {
    trip.mockReturnValue(undefined);
    const { container } = render(<TripClueLine gameId={gameId} playback={{ kind: "paused", positionMs: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
