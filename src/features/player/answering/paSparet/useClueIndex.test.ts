import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClueIndex } from "./useClueIndex";

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
