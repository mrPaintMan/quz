import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RunningGameLink } from "./RunningGameLink";

const runningGame = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => runningGame() }));

describe("RunningGameLink", () => {
  it("links to the running game's live control", () => {
    runningGame.mockReturnValue({ _id: "game1", quizTitle: "Julquiz 2026" });
    render(<RunningGameLink />);
    expect(screen.getByRole("link", { name: "Pågår: Julquiz 2026 →" })).toHaveAttribute("href", "/admin/games/game1");
  });

  it("shows nothing while no game runs", () => {
    runningGame.mockReturnValue(null);
    const { container } = render(<RunningGameLink />);
    expect(container).toBeEmptyDOMElement();
  });
});
