import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { handOutcome } from "@/domain/scoring/handOutcome";
import { DrawingResult } from "./DrawingResult";

const answer = { type: "drawing" as const, strokes: [{ colour: "blue" as const, points: [0.1, 0.2] }] };
const renderResult = (points: number | null) =>
  render(<DrawingResult shown={{ type: "drawing" }} answer={answer} outcome={handOutcome(points)} imageUrls={{}} revealed={null} teamId="t1" />);

describe("DrawingResult", () => {
  it("shows the team's drawing waiting for its points", () => {
    renderResult(null);
    expect(screen.getByRole("img", { name: "Er teckning" })).toBeInTheDocument();
    expect(screen.getByText("Bedöms…")).toBeInTheDocument();
  });

  it("lights the drawing up with its points once given", () => {
    const { container } = renderResult(2);
    expect(screen.getByText("+2 p")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("result-lit");
  });

  it("shows it as sent when it scored nothing", () => {
    const { container } = renderResult(0);
    expect(screen.queryByText("Bedöms…")).not.toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass("result-lit");
  });
});
