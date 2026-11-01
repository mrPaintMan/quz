import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import type { Playback } from "@convex/games/playback";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { PlaybackControls } from "./PlaybackControls";

const mutations = { playMedia: vi.fn(), pauseMedia: vi.fn() };
vi.mock("@/features/host/shared/useHostMutation", () => ({
  // The generated api hands out a new reference on each access, so pick by name.
  useHostMutation: (mutation: FunctionReference<"mutation">) =>
    mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations],
}));

const gameId = "game1" as Id<"games">;

function renderControls(playback: Playback) {
  render(
    <ActionErrorProvider>
      <PlaybackControls gameId={gameId} playback={playback} />
    </ActionErrorProvider>,
  );
}

describe("PlaybackControls", () => {
  beforeEach(() => {
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  it("plays the paused clip it shows", async () => {
    const playback = { kind: "paused" as const, positionMs: 0 };
    renderControls(playback);
    await userEvent.click(screen.getByRole("button", { name: "Spela" }));
    expect(mutations.playMedia).toHaveBeenCalledWith({ gameId, from: playback });
  });

  it("pauses the playing clip it shows", async () => {
    const playback = { kind: "playing" as const, startedAt: 5 };
    renderControls(playback);
    expect(screen.getByText("Klippet spelas")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pausa" }));
    expect(mutations.pauseMedia).toHaveBeenCalledWith({ gameId, from: playback });
  });
});
