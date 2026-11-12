import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnswerOf } from "@convex/answers/answerContent";
import { MAX_DRAWING_POINTS } from "@/domain/questionTypes/drawing/drawingLimits";
import { DrawingInput } from "./DrawingInput";

const onChange = vi.fn();
type Drawing = AnswerOf<"drawing">;
const line = { colour: "black" as const, points: [0.1, 0.1, 0.2, 0.2] };

const renderInput = (answer: Drawing | null, disabled = false) =>
  render(<DrawingInput shown={{ type: "drawing" }} answer={answer} imageUrls={{}} disabled={disabled} onChange={onChange} />);

// Draws through the given points on the 400 × 300 paper, in pixels.
function draw(...points: [number, number][]) {
  const paper = screen.getByRole("img", { name: "Rita här" });
  const [first, ...rest] = points;
  fireEvent.pointerDown(paper, { clientX: first[0], clientY: first[1], pointerId: 1 });
  rest.forEach(([x, y]) => fireEvent.pointerMove(paper, { clientX: x, clientY: y, pointerId: 1 }));
  fireEvent.pointerUp(paper, { pointerId: 1 });
}

describe("DrawingInput", () => {
  beforeEach(() => {
    onChange.mockReset();
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 400, height: 300 } as DOMRect);
  });

  it("adds a finished stroke in the chosen pen, as parts of the paper", async () => {
    renderInput(null);
    await userEvent.click(screen.getByRole("button", { name: "Röd" }));
    expect(screen.getByRole("button", { name: "Röd" })).toHaveAttribute("aria-pressed", "true");
    draw([40, 30], [200, 150], [200.5, 150]);
    expect(onChange).toHaveBeenCalledWith({ type: "drawing", strokes: [{ colour: "red", points: [0.1, 0.1, 0.5, 0.5] }] });
  });

  it("keeps the strokes drawn before", () => {
    renderInput({ type: "drawing", strokes: [line] });
    draw([400, 300]);
    expect(onChange).toHaveBeenCalledWith({ type: "drawing", strokes: [line, { colour: "black", points: [1, 1] }] });
  });

  it("takes back the last stroke with Ångra and clears the paper with Rensa", async () => {
    renderInput({ type: "drawing", strokes: [line, line] });
    await userEvent.click(screen.getByRole("button", { name: "Ångra" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "drawing", strokes: [line] });
    await userEvent.click(screen.getByRole("button", { name: "Rensa" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "drawing", strokes: [] });
  });

  it("has nothing to take back on empty paper", () => {
    renderInput(null);
    expect(screen.getByRole("button", { name: "Ångra" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Rensa" })).toBeDisabled();
  });

  it("stops drawing once the paper is full", () => {
    const full = { colour: "black" as const, points: Array.from({ length: MAX_DRAWING_POINTS * 2 }, () => 0.5) };
    renderInput({ type: "drawing", strokes: [full] });
    expect(screen.getByText("Pappret är fullt.")).toBeInTheDocument();
    draw([10, 10], [100, 100]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the drawing as sent once locked", () => {
    renderInput({ type: "drawing", strokes: [line] }, true);
    expect(screen.getByRole("img", { name: "Er teckning" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ångra" })).not.toBeInTheDocument();
  });
});
