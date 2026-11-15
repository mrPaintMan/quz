import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TripGuess } from "@/domain/questionTypes/paSparet/paSparetAnswering";
import { PaSparetAnswer, PaSparetQuestion } from "./PaSparetDisplay";

const guess = (name: string, extra: Partial<TripGuess>): TripGuess => ({ teamId: name, name, colour: "red", guess: "Kiruna", brakePoints: 8, points: 0, result: "wrong", ...extra });

describe("PaSparetQuestion", () => {
  it("adds nothing to the film", () => {
    const { container } = render(<PaSparetQuestion />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("PaSparetAnswer", () => {
  it("shows the destination and each team's guess, braked or not, with what it scored", () => {
    const guesses = [
      guess("Röda", { result: "right", points: 8 }),
      guess("Blå", { result: "pending", guess: "Kirunaa" }),
      guess("Gröna", { brakePoints: null }),
    ];
    render(<PaSparetAnswer revealed={{ type: "paSparet", destination: "Kiruna", guesses }} imageUrls={{}} />);
    expect(screen.getByText("Rätt svar: Kiruna")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "RödaKiruna+8 p",
      "BlåKirunaaBedöms…",
      "GrönaBromsade inte",
    ]);
  });

  it("shows only the destination before any team has guessed", () => {
    render(<PaSparetAnswer revealed={{ type: "paSparet", destination: "Kiruna", guesses: [] }} imageUrls={{}} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
