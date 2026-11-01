import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { GameControl } from "./GameControl";

const runningGame = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => runningGame() }));
vi.mock("./LiveControl", () => ({ LiveControl: ({ game }: { game: { quizTitle: string } }) => <p>Styr {game.quizTitle}</p> }));

const gameId = "game1" as Id<"games">;

describe("GameControl", () => {
  beforeEach(() => runningGame.mockReset());

  it("shows the live control of the running game", () => {
    runningGame.mockReturnValue({ _id: gameId, quizTitle: "Julquiz 2026" });
    render(<GameControl gameId={gameId} />);
    expect(screen.getByText("Styr Julquiz 2026")).toBeInTheDocument();
  });

  it("says the game is over when it no longer runs", () => {
    runningGame.mockReturnValue(null);
    render(<GameControl gameId={gameId} />);
    expect(screen.getByText("Quizet är slut.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Till dina quiz" })).toHaveAttribute("href", "/admin");
  });

  it("says the game is over when another game runs", () => {
    runningGame.mockReturnValue({ _id: "game2", quizTitle: "Julquiz 2027" });
    render(<GameControl gameId={gameId} />);
    expect(screen.getByText("Quizet är slut.")).toBeInTheDocument();
  });

  it("waits while loading", () => {
    runningGame.mockReturnValue(undefined);
    render(<GameControl gameId={gameId} />);
    expect(screen.getByText("Hämtar quizet…")).toBeInTheDocument();
  });
});
