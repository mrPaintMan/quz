import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DrawingAnswer, DrawingQuestion } from "./DrawingDisplay";

const drawing = (name: string) => ({ teamId: name, name, colour: "red" as const, strokes: [{ colour: "black" as const, points: [0.1, 0.2] }] });

describe("DrawingQuestion", () => {
  it("adds nothing to the prompt", () => {
    const { container } = render(<DrawingQuestion />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("DrawingAnswer", () => {
  it("shows every team's drawing with its name", () => {
    render(<DrawingAnswer revealed={{ type: "drawing", drawings: [drawing("Tomtarna"), drawing("Renarna")] }} imageUrls={{}} />);
    expect(screen.getByRole("img", { name: "Tomtarnas teckning" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Tomtarna", "Renarna"]);
  });

  it("spreads more than four drawings over three columns", () => {
    const drawings = ["A", "B", "C", "D", "E"].map(drawing);
    render(<DrawingAnswer revealed={{ type: "drawing", drawings }} imageUrls={{}} />);
    expect(screen.getByRole("list")).toHaveStyle({ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "repeat(2, minmax(0, 1fr))" });
  });

  it("says when no team drew anything", () => {
    render(<DrawingAnswer revealed={{ type: "drawing", drawings: [] }} imageUrls={{}} />);
    expect(screen.getByText("Inga teckningar.")).toBeInTheDocument();
  });
});
