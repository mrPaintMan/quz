import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { api } from "@convex/_generated/api";
import { HostSessionProvider } from "./HostSession";
import { useHostMutation } from "./useHostMutation";

const run = vi.fn().mockResolvedValue("quiz-id");
vi.mock("convex/react", () => ({ useMutation: () => run }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <HostSessionProvider session={{ passphrase: "pepparkaka", logOut: vi.fn() }}>{children}</HostSessionProvider>
);

describe("useHostMutation", () => {
  it("adds the passphrase to the mutation's arguments", async () => {
    const { result } = renderHook(() => useHostMutation(api.quizzes.mutations.createQuiz), { wrapper });
    await expect(result.current({ title: "Julquiz", year: 2026 })).resolves.toBe("quiz-id");
    expect(run).toHaveBeenCalledWith({ title: "Julquiz", year: 2026, hostPassphrase: "pepparkaka" });
  });
});
