import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow";

describe("useNow", () => {
  afterEach(() => vi.useRealTimers());

  it("refreshes the time on each interval", () => {
    vi.useFakeTimers({ now: 1_000 });
    const { result } = renderHook(() => useNow(10_000));
    expect(result.current).toBe(1_000);
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBe(11_000);
  });
});
