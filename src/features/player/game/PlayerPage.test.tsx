import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName, type FunctionReference } from "convex/server";
import { api } from "@convex/_generated/api";
import { PlayerPage } from "./PlayerPage";

const runningGame = vi.fn();
const savedTeam = vi.fn();
vi.mock("convex/react", () => ({
  // The generated api hands out a new reference on each access, so compare by name.
  useQuery: (query: FunctionReference<"query">, args?: unknown) => {
    const name = getFunctionName(query);
    if (name === getFunctionName(api.games.queries.getRunningGame)) return runningGame();
    if (name === getFunctionName(api.teams.queries.getTeam)) return args === "skip" ? undefined : savedTeam();
    return [];
  },
  useMutation: () => vi.fn(),
}));

const game = { _id: "game1", quizTitle: "Julquiz 2026", screen: { kind: "lobby" }, view: { kind: "lobby" } };

describe("PlayerPage", () => {
  beforeEach(() => {
    runningGame.mockReturnValue(game);
    savedTeam.mockReturnValue(undefined);
  });
  afterEach(() => window.localStorage.clear());

  it("waits while the game is loading", () => {
    runningGame.mockReturnValue(undefined);
    render(<PlayerPage />);
    expect(screen.getByText("Hämtar quizet…")).toBeInTheDocument();
  });

  it("says so when no game is running", () => {
    runningGame.mockReturnValue(null);
    render(<PlayerPage />);
    expect(screen.getByText("Inget quiz pågår just nu.")).toBeInTheDocument();
  });

  it("thanks a team whose game has ended", () => {
    window.localStorage.setItem("quz.teamId", "team1");
    runningGame.mockReturnValue(null);
    render(<PlayerPage />);
    expect(screen.getByText("Quizet är slut. Tack för i kväll!")).toBeInTheDocument();
  });

  it("lets a new phone join", () => {
    render(<PlayerPage />);
    expect(screen.getByRole("button", { name: "Gå med" })).toBeInTheDocument();
  });

  it("follows the game as the team saved on the phone", () => {
    window.localStorage.setItem("quz.teamId", "team1");
    savedTeam.mockReturnValue({ _id: "team1", name: "Tomtarna", colour: "red" });
    render(<PlayerPage />);
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ni är med!");
  });

  it("forgets a saved team that can't play this game and lets the phone join anew", () => {
    window.localStorage.setItem("quz.teamId", "old");
    savedTeam.mockReturnValue(null);
    render(<PlayerPage />);
    expect(screen.getByRole("button", { name: "Gå med" })).toBeInTheDocument();
    expect(window.localStorage.getItem("quz.teamId")).toBeNull();
  });

  it("waits while the saved team is loading", () => {
    window.localStorage.setItem("quz.teamId", "team1");
    render(<PlayerPage />);
    expect(screen.getByText("Hämtar quizet…")).toBeInTheDocument();
  });
});
