import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { StartGameButton } from "./StartGameButton";

const push = vi.fn();
const runningGame = vi.fn();
const startGame = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("convex/react", () => ({ useQuery: () => runningGame() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({ useHostMutation: () => startGame }));

const quizId = "quiz1" as Id<"quizzes">;

describe("StartGameButton", () => {
  beforeEach(() => {
    push.mockReset();
    startGame.mockReset().mockResolvedValue("game1");
    runningGame.mockReturnValue(null);
  });

  it("starts the game and opens its live control", async () => {
    render(<StartGameButton quizId={quizId} disabled={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Starta quiz" }));
    expect(startGame).toHaveBeenCalledWith({ quizId });
    expect(push).toHaveBeenCalledWith("/admin/games/game1");
  });

  it("asks before ending another game that is running", async () => {
    runningGame.mockReturnValue({ _id: "game0", quizId: "quiz0", quizTitle: "Julquiz 2025" });
    render(<StartGameButton quizId={quizId} disabled={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Starta quiz" }));
    expect(await screen.findByText("”Julquiz 2025” pågår just nu. Startar du det här quizet avslutas det.")).toBeInTheDocument();
    expect(startGame).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Avsluta och starta" }));
    expect(startGame).toHaveBeenCalledWith({ quizId });
  });

  it("stays disabled while the quiz isn't ready", () => {
    runningGame.mockReturnValue({ _id: "game0", quizId: "quiz0", quizTitle: "Julquiz 2025" });
    render(<StartGameButton quizId={quizId} disabled />);
    expect(screen.getByRole("button", { name: "Starta quiz" })).toBeDisabled();
  });

  it("leads back to the game while this quiz runs, instead of restarting it", () => {
    runningGame.mockReturnValue({ _id: "game1", quizId, quizTitle: "Julquiz 2026" });
    render(<StartGameButton quizId={quizId} disabled={false} />);
    expect(screen.getByRole("link", { name: "Till spelet" })).toHaveAttribute("href", "/admin/games/game1");
    expect(screen.queryByRole("button", { name: "Starta quiz" })).not.toBeInTheDocument();
  });
});
