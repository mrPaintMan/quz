import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { Timer } from "@convex/games/timer";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { TimerControls } from "./TimerControls";

const mutations = { pauseGameTimer: vi.fn(), resumeGameTimer: vi.fn(), extendGameTimer: vi.fn() };
vi.mock("@/features/host/shared/useHostMutation", () => ({
  // The generated api hands out a new reference on each access, so pick by name.
  useHostMutation: (mutation: FunctionReference<"mutation">) =>
    mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations],
}));

const gameId = "game1" as Id<"games">;

function renderControls(timer: Timer) {
  render(
    <ActionErrorProvider>
      <TimerControls gameId={gameId} timer={timer} />
    </ActionErrorProvider>,
  );
}

describe("TimerControls", () => {
  beforeEach(() => {
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  it("pauses a running timer", async () => {
    renderControls({ kind: "running", endsAt: Date.now() + 42_000 });
    expect(screen.getByRole("timer")).toHaveTextContent("0:42");
    await userEvent.click(screen.getByRole("button", { name: "Pausa" }));
    expect(mutations.pauseGameTimer).toHaveBeenCalledWith({ gameId });
  });

  it("resumes a paused timer", async () => {
    renderControls({ kind: "paused", remainingMs: 20_000 });
    expect(screen.getByRole("timer")).toHaveTextContent("0:20");
    await userEvent.click(screen.getByRole("button", { name: "Fortsätt" }));
    expect(mutations.resumeGameTimer).toHaveBeenCalledWith({ gameId });
  });

  it("gives 15 seconds more", async () => {
    renderControls({ kind: "paused", remainingMs: 0 });
    expect(screen.getByRole("timer")).toHaveTextContent("Tiden är ute!");
    await userEvent.click(screen.getByRole("button", { name: "+15 s" }));
    expect(mutations.extendGameTimer).toHaveBeenCalledWith({ gameId });
  });
});
