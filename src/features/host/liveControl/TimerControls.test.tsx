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

  it("pauses the running timer it shows", async () => {
    const timer = { kind: "running" as const, endsAt: Date.now() + 42_000 };
    renderControls(timer);
    expect(screen.getByRole("timer")).toHaveTextContent("0:42");
    await userEvent.click(screen.getByRole("button", { name: "Pausa" }));
    expect(mutations.pauseGameTimer).toHaveBeenCalledWith({ gameId, from: timer });
  });

  it("resumes the paused timer it shows", async () => {
    const timer = { kind: "paused" as const, remainingMs: 20_000 };
    renderControls(timer);
    expect(screen.getByRole("timer")).toHaveTextContent("0:20");
    await userEvent.click(screen.getByRole("button", { name: "Fortsätt" }));
    expect(mutations.resumeGameTimer).toHaveBeenCalledWith({ gameId, from: timer });
  });

  it("gives 15 seconds more", async () => {
    const timer = { kind: "paused" as const, remainingMs: 0 };
    renderControls(timer);
    expect(screen.getByRole("timer")).toHaveTextContent("Tiden är ute!");
    await userEvent.click(screen.getByRole("button", { name: "+15 s" }));
    expect(mutations.extendGameTimer).toHaveBeenCalledWith({ gameId, from: timer });
  });

  it("can't pause once the time is out", () => {
    renderControls({ kind: "running", endsAt: Date.now() - 1_000 });
    expect(screen.getByRole("button", { name: "Pausa" })).toBeDisabled();
  });
});
