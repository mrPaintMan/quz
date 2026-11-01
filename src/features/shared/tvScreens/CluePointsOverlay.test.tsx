import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CluePointsOverlay } from "./CluePointsOverlay";

describe("CluePointsOverlay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows nothing before the film plays", () => {
    const { container } = render(<CluePointsOverlay points={null} />);
    expect(container.firstChild).toHaveClass("opacity-0");
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("fades the first number in at once", () => {
    const { rerender } = render(<CluePointsOverlay points={null} />);
    rerender(<CluePointsOverlay points={10} />);
    expect(screen.getByText("10")).toHaveClass("opacity-100");
  });

  it("fades the old number out before the new one fades in", () => {
    const { rerender } = render(<CluePointsOverlay points={10} />);
    rerender(<CluePointsOverlay points={8} />);
    expect(screen.getByText("10")).toHaveClass("opacity-0");
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByText("8")).toHaveClass("opacity-100");
  });

  it("fades out when the film ends", () => {
    const { rerender, container } = render(<CluePointsOverlay points={2} />);
    rerender(<CluePointsOverlay points={null} />);
    expect(screen.getByText("2")).toHaveClass("opacity-0");
    act(() => vi.advanceTimersByTime(500));
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
