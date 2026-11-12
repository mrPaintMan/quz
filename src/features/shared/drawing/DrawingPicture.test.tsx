import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DrawingPicture, strokePath } from "./DrawingPicture";

describe("strokePath", () => {
  it("draws a line through the stroke's points on the 400 × 300 canvas", () => {
    expect(strokePath([0, 0, 0.5, 0.5, 1, 1])).toBe("M 0 0 L 200 150 L 400 300");
  });

  it("draws a single point as a dot, and nothing without one", () => {
    expect(strokePath([0.5, 0.5])).toBe("M 200 150 l 0.1 0");
    expect(strokePath([])).toBe("");
  });
});

describe("DrawingPicture", () => {
  it("draws each stroke in its pen's ink on white paper", () => {
    render(<DrawingPicture strokes={[{ colour: "red", points: [0, 0, 1, 1] }]} label="Röda lagets teckning" />);
    const picture = screen.getByRole("img", { name: "Röda lagets teckning" });
    expect(picture.querySelector("path")).toHaveAttribute("stroke", "#d62f2f");
    expect(picture.querySelector("rect")).toHaveAttribute("fill", "#ffffff");
  });
});
