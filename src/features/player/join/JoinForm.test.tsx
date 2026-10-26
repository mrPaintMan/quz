import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConvexError } from "convex/values";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { JoinForm } from "./JoinForm";

const teams = vi.fn();
const joinGame = vi.fn();
vi.mock("convex/react", () => ({ useQuery: () => teams(), useMutation: () => joinGame }));

const gameId = "game1" as Id<"games">;

describe("JoinForm", () => {
  beforeEach(() => {
    teams.mockReturnValue([{ _id: "t1", name: "Tomtarna", colour: "red" }]);
    joinGame.mockReset();
  });

  it("joins with a name and a free colour", async () => {
    joinGame.mockResolvedValue("team2");
    const onJoined = vi.fn();
    render(<JoinForm gameId={gameId} quizTitle="Julquiz 2026" onJoined={onJoined} />);
    expect(screen.getByRole("heading", { name: "Julquiz 2026" })).toBeInTheDocument();
    const join = screen.getByRole("button", { name: "Gå med" });
    expect(join).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Lagets namn"), "Nissarna");
    await userEvent.click(screen.getByRole("radio", { name: "Grön" }));
    await userEvent.click(join);
    expect(joinGame).toHaveBeenCalledWith({ gameId, name: "Nissarna", colour: "green" });
    expect(onJoined).toHaveBeenCalledWith("team2");
  });

  it("greys out colours other teams have", () => {
    render(<JoinForm gameId={gameId} quizTitle="Julquiz" onJoined={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "Röd (upptagen)" })).toBeDisabled();
    expect(screen.getAllByRole("radio")).toHaveLength(12);
  });

  it("shows why joining failed", async () => {
    joinGame.mockRejectedValue(new ConvexError("Ett annat lag heter redan så. Välj ett annat namn."));
    const onJoined = vi.fn();
    render(<JoinForm gameId={gameId} quizTitle="Julquiz" onJoined={onJoined} />);
    await userEvent.type(screen.getByLabelText("Lagets namn"), "Tomtarna");
    await userEvent.click(screen.getByRole("radio", { name: "Blå" }));
    await userEvent.click(screen.getByRole("button", { name: "Gå med" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ett annat lag heter redan så.");
    expect(onJoined).not.toHaveBeenCalled();
  });

  it("waits for the teams before showing which colours are taken", () => {
    teams.mockReturnValue(undefined);
    render(<JoinForm gameId={gameId} quizTitle="Julquiz" onJoined={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "Röd" })).toBeEnabled();
  });
});
