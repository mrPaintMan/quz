import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useStoredPassphrase } from "./useStoredPassphrase";

describe("useStoredPassphrase", () => {
  afterEach(() => window.localStorage.clear());

  it("starts from what is stored and follows remember and forget", () => {
    const { result } = renderHook(() => useStoredPassphrase());
    expect(result.current.passphrase).toBeNull();

    act(() => result.current.remember("pepparkaka"));
    expect(result.current.passphrase).toBe("pepparkaka");

    act(() => result.current.forget());
    expect(result.current.passphrase).toBeNull();
  });

  it("picks up a change made in another tab", () => {
    const { result } = renderHook(() => useStoredPassphrase());
    act(() => {
      window.localStorage.setItem("quz.hostPassphrase", "lussekatt");
      window.dispatchEvent(new StorageEvent("storage"));
    });
    expect(result.current.passphrase).toBe("lussekatt");
  });
});
