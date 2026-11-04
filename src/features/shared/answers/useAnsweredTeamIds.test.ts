import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { useAnsweredTeamIds } from "./useAnsweredTeamIds";

const useQuery = vi.fn();
vi.mock("convex/react", () => ({ useQuery: (...args: unknown[]) => useQuery(...args) }));

const gameId = "game1" as Id<"games">;
const questionId = "q1" as Id<"questions">;

describe("useAnsweredTeamIds", () => {
  it("asks who has answered the question showing", () => {
    useQuery.mockReturnValue(["t1"]);
    const { result } = renderHook(() => useAnsweredTeamIds(gameId, { kind: "question", questionId }));
    expect(useQuery.mock.lastCall?.[1]).toEqual({ gameId, questionId });
    expect(result.current).toEqual(["t1"]);
  });

  it("asks nothing on other screens", () => {
    useQuery.mockReturnValue(undefined);
    const { result } = renderHook(() => useAnsweredTeamIds(gameId, { kind: "rules" }));
    expect(useQuery.mock.lastCall?.[1]).toBe("skip");
    expect(result.current).toBeNull();
  });
});
