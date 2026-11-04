import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { LeaderboardScreen } from "./LeaderboardScreen";

const team = (name: string, points: number, rank: number) => ({ _id: name, name, colour: "red", points, rank }) as unknown as TeamScore;

describe("LeaderboardScreen", () => {
  it("shows its title and the teams by place, with their points", () => {
    render(<LeaderboardScreen title="Slutresultat" scores={[team("Tomtarna", 12, 1), team("Renarna", 2.5, 2)]} />);
    expect(screen.getByRole("heading", { name: "Slutresultat" })).toBeInTheDocument();
    const [first, second] = screen.getAllByRole("listitem");
    expect(first).toHaveTextContent("1Tomtarna12 p");
    expect(second).toHaveTextContent("2Renarna2,5 p");
  });

  it("puts more than six teams in two columns", () => {
    const scores = Array.from({ length: 7 }, (_, index) => team(`Lag ${index + 1}`, 7 - index, index + 1));
    render(<LeaderboardScreen title="Slutresultat" scores={scores} />);
    expect(screen.getByRole("list")).toHaveClass("grid-cols-2");
  });

  it("says so before any team has joined", () => {
    render(<LeaderboardScreen title="Slutresultat" scores={[]} />);
    expect(screen.getByText("Inga lag har anmält sig.")).toBeInTheDocument();
  });

  it("shows only its title while the scores load", () => {
    render(<LeaderboardScreen title="Slutresultat" scores={undefined} />);
    expect(screen.getByRole("heading", { name: "Slutresultat" })).toBeInTheDocument();
    expect(screen.queryByText("Inga lag har anmält sig.")).not.toBeInTheDocument();
  });
});
