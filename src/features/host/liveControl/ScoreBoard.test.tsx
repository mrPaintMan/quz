import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TeamScore } from "@/features/shared/scores/useScores";
import { ScoreBoard } from "./ScoreBoard";

const team = (name: string, points: number, rank: number) => ({ _id: name, name, colour: "red", points, rank }) as unknown as TeamScore;

describe("ScoreBoard", () => {
  it("lists the teams by place with their points", () => {
    render(<ScoreBoard scores={[team("Tomtarna", 4, 1), team("Renarna", 4, 1)]} />);
    expect(screen.getByRole("heading", { name: "Topplista" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual(["1Tomtarna4 p", "1Renarna4 p"]);
  });

  it("shows nothing before any team has joined", () => {
    const { container } = render(<ScoreBoard scores={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
