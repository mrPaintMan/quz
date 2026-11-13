import { render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CluePointsCard, useClueIndex } from "./CluePointsCard";

describe("useClueIndex", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(50_000);
  });

  afterEach(() => vi.useRealTimers());

  it("follows the film on the server's clock", () => {
    const { result } = renderHook(() => useClueIndex({ playback: { kind: "playing", startedAt: 20_000 }, durationSeconds: 100 }));
    expect(result.current).toBe(1);
  });

  it("stays on the first clue before the film plays, or without its length", () => {
    expect(renderHook(() => useClueIndex(null)).result.current).toBe(0);
    expect(renderHook(() => useClueIndex({ playback: null, durationSeconds: 100 })).result.current).toBe(0);
    expect(renderHook(() => useClueIndex({ playback: { kind: "paused", positionMs: 90_000 }, durationSeconds: null })).result.current).toBe(0);
  });
});

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
