import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { outcomeOf, part } from "@/features/player/results/resultTestParts.setup";
import { MatchResult } from "./MatchResult";

describe("MatchResult", () => {
  it("draws the team's pairs, lighting the items and line of each pair that scored", () => {
    const shown = { type: "match" as const, left: ["Dancing Queen", "The Look"], right: ["Roxette", "ABBA"] };
    const answer = { type: "match" as const, rightByLeft: ["ABBA", null] };
    const { container } = render(<MatchResult shown={shown} answer={answer} outcome={outcomeOf(part("right"), part("wrong"))} imageUrls={{}} revealed={null} teamId="t1" />);
    expect(screen.getByText("1 av 2 par")).toBeInTheDocument();
    expect(screen.getByText("Dancing Queen").closest(".result-lit")).not.toBeNull();
    expect(screen.getByText("ABBA").parentElement).toHaveClass("result-lit");
    expect(screen.getByText("Roxette").parentElement).not.toHaveClass("result-lit");
    expect(screen.getByText("+1 p")).toBeInTheDocument();
    const lines = container.querySelectorAll("path");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveAttribute("stroke", "var(--primary)");
  });

  it("marks a wrong pair's left item with ✕ and the right partner under it, its line grey", () => {
    const shown = { type: "match" as const, left: ["Waterloo"], right: ["Kent"] };
    const wrong = { ...part("wrong"), correct: "ABBA" };
    const { container } = render(
      <MatchResult shown={shown} answer={{ type: "match", rightByLeft: ["Kent"] }} outcome={outcomeOf(wrong)} imageUrls={{}} revealed={null} teamId="t1" />,
    );
    expect(container.querySelector("path")).toHaveAttribute("stroke", "var(--muted-foreground)");
    expect(screen.getByRole("img", { name: "Fel" })).toBeInTheDocument();
    expect(screen.getByText("rätt: ABBA")).toBeInTheDocument();
  });
});
