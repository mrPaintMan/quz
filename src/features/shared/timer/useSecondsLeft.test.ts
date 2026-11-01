import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Timer } from "@convex/games/timer";
import { useSecondsLeft } from "./useSecondsLeft";

describe("useSecondsLeft", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down while the timer runs", () => {
    const { result } = renderHook(() => useSecondsLeft({ kind: "running", endsAt: 130_000 }));
    expect(result.current).toBe(30);
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(20);
  });

  it("stands still while paused", () => {
    const { result } = renderHook(() => useSecondsLeft({ kind: "paused", remainingMs: 12_000 }));
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(12);
  });

  it("is null without a timer", () => {
    const { result } = renderHook(() => useSecondsLeft(null));
    expect(result.current).toBeNull();
  });

  it("follows a timer that is changed", () => {
    const { result, rerender } = renderHook(({ timer }: { timer: Timer }) => useSecondsLeft(timer), {
      initialProps: { timer: { kind: "running", endsAt: 130_000 } },
    });
    rerender({ timer: { kind: "running", endsAt: 145_000 } });
    expect(result.current).toBe(45);
  });
});
