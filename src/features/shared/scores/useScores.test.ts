import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { useScores } from "./useScores";

const useQuery = vi.fn();
vi.mock("convex/react", () => ({ useQuery: (...args: unknown[]) => useQuery(...args) }));

const gameId = "game1" as Id<"games">;

describe("useScores", () => {
  it("follows the game's scores", () => {
    useQuery.mockReturnValue([{ name: "Röda", points: 2 }]);
    const { result } = renderHook(() => useScores(gameId));
    expect(useQuery.mock.lastCall?.[1]).toEqual({ gameId });
    expect(result.current).toEqual([{ name: "Röda", points: 2 }]);
  });

  it("follows nothing when not enabled", () => {
    useQuery.mockReturnValue(undefined);
    const { result } = renderHook(() => useScores(gameId, false));
    expect(useQuery.mock.lastCall?.[1]).toBe("skip");
    expect(result.current).toBeUndefined();
  });
});
