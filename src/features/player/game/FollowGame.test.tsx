import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FollowGame } from "./FollowGame";

const team = { name: "Tomtarna", colour: "red" as const };
const question = { kind: "question" as const, roundNumber: 1, questionNumber: 1, prompt: "Vilken krydda?", answeredInApp: true };

describe("FollowGame", () => {
  it("shows the team and what is going on", () => {
    render(<FollowGame team={team} view={{ kind: "lobby" }} timer={null} />);
    expect(screen.getByText("Tomtarna")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Ni är med! Vi börjar snart.");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("shows the question's timer", () => {
    render(<FollowGame team={team} view={question} timer={{ kind: "paused", remainingMs: 42_000 }} />);
    expect(screen.getByRole("timer")).toHaveTextContent("0:42");
  });
});
