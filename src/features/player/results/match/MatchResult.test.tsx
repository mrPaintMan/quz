import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { MatchResult } from "./MatchResult";

describe("MatchResult", () => {
  it("draws the team's pairs, lighting the items and line of each pair that scored", () => {
    const shown = { type: "match" as const, left: ["Dancing Queen", "The Look"], right: ["Roxette", "ABBA"] };
    const answer = { type: "match" as const, rightByLeft: ["ABBA", null] };
    const { container } = render(<MatchResult shown={shown} answer={answer} outcome={outcomeOf(part("right"), part("wrong"))} imageUrls={{}} />);
    expect(screen.getByText("1 av 2 par")).toBeInTheDocument();
    expect(screen.getByText("Dancing Queen").parentElement).toHaveClass("result-lit");
    expect(screen.getByText("ABBA").parentElement).toHaveClass("result-lit");
    expect(screen.getByText("Roxette").parentElement).not.toHaveClass("result-lit");
    expect(screen.getByText("+1 p")).toBeInTheDocument();
    const lines = container.querySelectorAll("path");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveAttribute("stroke", "var(--primary)");
  });

  it("greys the line of a pair that scored nothing", () => {
    const shown = { type: "match" as const, left: ["Waterloo"], right: ["Kent"] };
    const { container } = render(
      <MatchResult shown={shown} answer={{ type: "match", rightByLeft: ["Kent"] }} outcome={outcomeOf(part("wrong"))} imageUrls={{}} />,
    );
    expect(container.querySelector("path")).toHaveAttribute("stroke", "var(--muted-foreground)");
  });
});
