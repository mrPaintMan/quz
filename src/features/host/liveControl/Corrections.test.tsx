import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFunctionName, type FunctionReference } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import { ActionErrorProvider } from "@/features/host/shared/ActionErrorProvider";
import { Corrections } from "./Corrections";

const corrections = vi.fn();
const mutations = { addCorrection: vi.fn(), removeCorrection: vi.fn() };
vi.mock("@/features/host/shared/useHostQuery", () => ({ useHostQuery: () => corrections() }));
vi.mock("@/features/host/shared/useHostMutation", () => ({
  // The generated api hands out a new reference on each access, so pick by name.
  useHostMutation: (mutation: FunctionReference<"mutation">) => mutations[getFunctionName(mutation).split(":")[1] as keyof typeof mutations],
}));

const gameId = "game1" as Id<"games">;
const red = "red1" as Id<"teams">;
const blue = "blue1" as Id<"teams">;
const teams = [
  { _id: red, name: "Tomtarna", colour: "red" as const },
  { _id: blue, name: "Renarna", colour: "blue" as const },
];

const renderCorrections = (forTeams = teams) =>
  render(
    <ActionErrorProvider>
      <Corrections gameId={gameId} teams={forTeams} />
    </ActionErrorProvider>,
  );

describe("Corrections", () => {
  beforeEach(() => {
    corrections.mockReturnValue([]);
    Object.values(mutations).forEach((mutation) => mutation.mockReset().mockResolvedValue(null));
  });

  it("adds points to the chosen team, or takes them away, and empties the field", async () => {
    renderCorrections();
    const add = screen.getByRole("button", { name: "Lägg till" });
    expect(add).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText("Lag"), "Renarna");
    await userEvent.type(screen.getByLabelText("Poäng"), "-1,5");
    await userEvent.click(add);
    expect(mutations.addCorrection).toHaveBeenCalledWith({ gameId, teamId: blue, points: -1.5 });
    expect(screen.getByLabelText("Poäng")).toHaveValue("");
  });

  it("adds to the first team unless another is chosen", async () => {
    renderCorrections();
    await userEvent.type(screen.getByLabelText("Poäng"), "2{Enter}");
    expect(mutations.addCorrection).toHaveBeenCalledWith({ gameId, teamId: red, points: 2 });
  });

  it("won't add nothing", async () => {
    renderCorrections();
    await userEvent.type(screen.getByLabelText("Poäng"), "0{Enter}");
    expect(screen.getByRole("button", { name: "Lägg till" })).toBeDisabled();
    expect(mutations.addCorrection).not.toHaveBeenCalled();
  });

  it("lists the corrections with their sign, and takes one back", async () => {
    corrections.mockReturnValue([
      { _id: "a2", teamId: blue, points: -1 },
      { _id: "a1", teamId: red, points: 2 },
    ]);
    renderCorrections();
    expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual(["Renarna-1 p✕", "Tomtarna+2 p✕"]);
    await userEvent.click(screen.getByRole("button", { name: "Ta bort rättelsen för Renarna" }));
    expect(mutations.removeCorrection).toHaveBeenCalledWith({ gameId, adjustmentId: "a2" });
  });

  it("shows nothing before any team has joined", () => {
    const { container } = renderCorrections([]);
    expect(container).toBeEmptyDOMElement();
  });
});
