import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDraftSaver } from "./useDraftSaver";

const draft = (value: number) => ({ type: "number" as const, value });

function hidePage() {
  Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useDraftSaver", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
  });

  it("saves only the latest draft, a second after the team pauses", () => {
    const save = vi.fn();
    const { result } = renderHook(() => useDraftSaver(save));
    act(() => {
      result.current.schedule(draft(1));
      vi.advanceTimersByTime(600);
      result.current.schedule(draft(12));
      vi.advanceTimersByTime(999);
    });
    expect(save).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(save).toHaveBeenCalledExactlyOnceWith(draft(12));
  });

  it("saves a waiting draft at once when the page is hidden, as when the phone locks", () => {
    const save = vi.fn();
    const { result } = renderHook(() => useDraftSaver(save));
    act(() => result.current.schedule(draft(7)));
    act(() => hidePage());
    expect(save).toHaveBeenCalledExactlyOnceWith(draft(7));
    act(() => vi.advanceTimersByTime(1000));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("saves a waiting draft when the page is left", () => {
    const save = vi.fn();
    const { result } = renderHook(() => useDraftSaver(save));
    act(() => result.current.schedule(draft(7)));
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(save).toHaveBeenCalledExactlyOnceWith(draft(7));
  });

  it("saves nothing once cancelled, as when the answer is sent", () => {
    const save = vi.fn();
    const { result } = renderHook(() => useDraftSaver(save));
    act(() => {
      result.current.schedule(draft(1));
      result.current.cancel();
      vi.advanceTimersByTime(1000);
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("saves a waiting draft when the question changes", () => {
    const save = vi.fn();
    const { result, unmount } = renderHook(() => useDraftSaver(save));
    act(() => result.current.schedule(draft(7)));
    unmount();
    expect(save).toHaveBeenCalledExactlyOnceWith(draft(7));
  });

  it("saves nothing on hiding with no draft waiting", () => {
    const save = vi.fn();
    renderHook(() => useDraftSaver(save));
    act(() => hidePage());
    expect(save).not.toHaveBeenCalled();
  });
});
