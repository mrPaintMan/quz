import { render, screen } from "@testing-library/react";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@convex/_generated/api";
import { TvPage } from "./TvPage";

const runningGame = vi.fn();
const teams = vi.fn();
vi.mock("convex/react", () => ({
  // The generated api hands out a new reference on each access, so compare by name.
  useQuery: (query: FunctionReference<"query">, args?: unknown) =>
    getFunctionName(query) === getFunctionName(api.games.queries.getRunningGame) ? runningGame() : args === "skip" ? undefined : teams(),
}));

describe("TvPage", () => {
  beforeEach(() => teams.mockReturnValue([{ _id: "t1", name: "Tomtarna", colour: "red" }]));

  it("waits while the game is loading", () => {
    runningGame.mockReturnValue(undefined);
    render(<TvPage />);
    expect(screen.getByText("Hämtar quizet…")).toBeInTheDocument();
  });

  it("says so when no game is running", () => {
    runningGame.mockReturnValue(null);
    render(<TvPage />);
    expect(screen.getByText("Inget quiz pågår just nu.")).toBeInTheDocument();
  });

  it("shows the running game's screen with its teams", () => {
    runningGame.mockReturnValue({ _id: "game1", quizTitle: "Julquiz 2026", screen: { kind: "lobby" }, view: { kind: "lobby" } });
    render(<TvPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Julquiz 2026" })).toBeInTheDocument();
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
  });
});
