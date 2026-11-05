import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDraftSaver } from "./useDraftSaver";

const draft = (value: number) => ({ type: "number" as const, value });

describe("useDraftSaver", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("saves only the latest draft, once the team pauses", () => {
    const save = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useDraftSaver(save));
    act(() => {
      result.current.schedule(draft(1));
      result.current.schedule(draft(12));
    });
    expect(save).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(400));
    expect(save).toHaveBeenCalledExactlyOnceWith(draft(12));
  });

  it("saves nothing once cancelled, as when the answer is sent", () => {
    const save = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => useDraftSaver(save));
    act(() => {
      result.current.schedule(draft(1));
      result.current.cancel();
      vi.advanceTimersByTime(400);
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("saves a waiting draft at once when the question changes", () => {
    const save = vi.fn().mockResolvedValue(null);
    const { result, unmount } = renderHook(() => useDraftSaver(save));
    act(() => result.current.schedule(draft(7)));
    unmount();
    expect(save).toHaveBeenCalledExactlyOnceWith(draft(7));
  });
});
