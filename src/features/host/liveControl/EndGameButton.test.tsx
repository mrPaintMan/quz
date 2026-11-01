import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { EndGameButton } from "./EndGameButton";

const push = vi.fn();
const endGame = vi.fn().mockResolvedValue(null);
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => endGame }));

describe("EndGameButton", () => {
  it("ends the game after confirming and goes back to the quizzes", async () => {
    const gameId = "game1" as Id<"games">;
    render(
      <ActionErrorProvider>
        <EndGameButton gameId={gameId} />
      </ActionErrorProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Avsluta quiz" }));
    await userEvent.click(await screen.findByRole("button", { name: "Avsluta" }));
    expect(endGame).toHaveBeenCalledWith({ gameId });
    expect(push).toHaveBeenCalledWith("/admin");
  });
});
