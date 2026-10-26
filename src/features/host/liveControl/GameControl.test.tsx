import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { HostSessionProvider } from "@/features/host/shared/HostSessionProvider";
import { GameControl } from "./GameControl";

const push = vi.fn();
const runningGame = vi.fn();
const mutations = { goToNextScreen: vi.fn(), goToPreviousScreen: vi.fn(), endGame: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("convex/react", () => ({ useQuery: () => runningGame() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({
  // The generated api hands out a new reference on each access, so pick by name.
  useHostMutation: (mutation: FunctionReference<"mutation">) =>
    mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations],
}));

const gameId = "game1" as Id<"games">;
const game = { _id: gameId, quizTitle: "Julquiz 2026", screen: { kind: "rules" }, view: { kind: "rules", roundCount: 1, questionCount: 1, activityCount: 0 } };

function renderControl() {
  render(
    <HostSessionProvider session={{ passphrase: "p", logOut: vi.fn() }}>
      <ActionErrorProvider>
        <GameControl gameId={gameId} />
      </ActionErrorProvider>
    </HostSessionProvider>,
  );
}

describe("GameControl", () => {
  beforeEach(() => {
    runningGame.mockReturnValue(game);
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
    push.mockReset();
  });

  it("shows what the TV shows and steps from that screen", async () => {
    renderControl();
    expect(screen.getByRole("status")).toHaveTextContent("Regler");
    await userEvent.click(screen.getByRole("button", { name: "Nästa" }));
    expect(mutations.goToNextScreen).toHaveBeenCalledWith({ gameId, from: { kind: "rules" } });
    await userEvent.click(screen.getByRole("button", { name: "Föregående" }));
    expect(mutations.goToPreviousScreen).toHaveBeenCalledWith({ gameId, from: { kind: "rules" } });
  });

  it("ends the game after confirming and goes back to the quizzes", async () => {
    renderControl();
    await userEvent.click(screen.getByRole("button", { name: "Avsluta quiz" }));
    await userEvent.click(await screen.findByRole("button", { name: "Avsluta" }));
    expect(mutations.endGame).toHaveBeenCalledWith({ gameId });
    expect(push).toHaveBeenCalledWith("/admin");
  });

  it("links to the TV view", () => {
    renderControl();
    expect(screen.getByRole("link", { name: "Öppna TV-vyn" })).toHaveAttribute("href", "/tv");
  });

  it("says the game is over when it no longer runs", () => {
    runningGame.mockReturnValue(null);
    renderControl();
    expect(screen.getByText("Quizet är slut.")).toBeInTheDocument();
  });

  it("waits while loading", () => {
    runningGame.mockReturnValue(undefined);
    renderControl();
    expect(screen.getByText("Hämtar quizet…")).toBeInTheDocument();
  });
});
