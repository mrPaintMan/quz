import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CluePointsCard } from "./CluePointsCard";

describe("CluePointsCard", () => {
  it("shows what a brake is worth now, and the stops passed struck out", () => {
    render(<CluePointsCard index={1} />);
    expect(screen.getByText("Ledtråd 2 av 5 · drar ni nu får ni")).toBeInTheDocument();
    expect(screen.getByText("8 poäng")).toBeInTheDocument();
    expect(screen.getByText("10")).toHaveClass("line-through");
    expect(screen.getByText("6")).not.toHaveClass("line-through");
  });

  it("calls the first clue by name", () => {
    render(<CluePointsCard index={0} />);
    expect(screen.getByText("Första ledtråden · drar ni nu får ni")).toBeInTheDocument();
  });
});
