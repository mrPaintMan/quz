import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./useAutosave";

describe("useAutosave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("does not save the initial value", () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutosave("a", save, 500));
    act(() => vi.advanceTimersByTime(1000));
    expect(save).not.toHaveBeenCalled();
  });

  it("saves once, after the value has stopped changing", () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(({ value }) => useAutosave(value, save, 500), { initialProps: { value: "a" } });
    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(300));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(499));
    expect(save).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(save).toHaveBeenCalledExactlyOnceWith("abc");
  });

  it("saves a pending change when unmounted", () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(({ value }) => useAutosave(value, save, 500), { initialProps: { value: "a" } });
    rerender({ value: "ab" });
    unmount();
    expect(save).toHaveBeenCalledExactlyOnceWith("ab");
  });

  it("does not save again on unmount when nothing is pending", () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { rerender, unmount } = renderHook(({ value }) => useAutosave(value, save, 500), { initialProps: { value: "a" } });
    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(500));
    unmount();
    expect(save).toHaveBeenCalledOnce();
  });

  it("reports a failed save until a later save works", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value }) => useAutosave(value, save, 500), { initialProps: { value: "a" } });
    rerender({ value: "ab" });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.saveFailed).toBe(true);
    rerender({ value: "abc" });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.saveFailed).toBe(false);
  });
});
