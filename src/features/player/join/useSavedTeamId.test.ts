import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSavedTeamId } from "./useSavedTeamId";

describe("useSavedTeamId", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("reads the team saved on this phone", () => {
    window.localStorage.setItem("quz.teamId", "team1");
    const { result } = renderHook(() => useSavedTeamId());
    expect(result.current[0]).toBe("team1");
  });

  it("saves and forgets the team", () => {
    const { result } = renderHook(() => useSavedTeamId());
    expect(result.current[0]).toBeNull();
    act(() => result.current[1]("team2"));
    expect(result.current[0]).toBe("team2");
    expect(window.localStorage.getItem("quz.teamId")).toBe("team2");
    act(() => result.current[1](null));
    expect(window.localStorage.getItem("quz.teamId")).toBeNull();
  });

  it("follows a team saved in another tab", () => {
    const { result } = renderHook(() => useSavedTeamId());
    act(() => {
      window.localStorage.setItem("quz.teamId", "team4");
      window.dispatchEvent(new StorageEvent("storage", { key: "quz.teamId" }));
    });
    expect(result.current[0]).toBe("team4");
  });

  it("still works for this visit when the browser refuses storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useSavedTeamId());
    expect(result.current[0]).toBeNull();
    act(() => result.current[1]("team3"));
    expect(result.current[0]).toBe("team3");
    act(() => result.current[1](null));
  });
});
