import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@convex/_generated/api";
import { HostSessionProvider } from "./HostSessionProvider";
import { useHostQuery } from "./useHostQuery";

const useQuery = vi.fn();
vi.mock("convex/react", () => ({ useQuery: (...args: unknown[]) => useQuery(...args) }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <HostSessionProvider session={{ passphrase: "pepparkaka", logOut: vi.fn() }}>{children}</HostSessionProvider>
);

describe("useHostQuery", () => {
  beforeEach(() => useQuery.mockReset());

  it("adds the passphrase to the query's arguments", () => {
    useQuery.mockReturnValue([]);
    const { result } = renderHook(() => useHostQuery(api.quizzes.queries.listQuizzes, {}), { wrapper });
    expect(useQuery).toHaveBeenCalledWith(api.quizzes.queries.listQuizzes, { hostPassphrase: "pepparkaka" });
    expect(result.current).toEqual([]);
  });

  it("passes skip through untouched", () => {
    renderHook(() => useHostQuery(api.quizzes.queries.listQuizzes, "skip"), { wrapper });
    expect(useQuery).toHaveBeenCalledWith(api.quizzes.queries.listQuizzes, "skip");
  });
});
