import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaSparetInput } from "./PaSparetInput";

const renderInput = (answer: { type: "paSparet"; guess: string; brakeClueIndex: number | null } | null, disabled = false, onChange = vi.fn()) =>
  render(<PaSparetInput shown={{ type: "paSparet" }} answer={answer} imageUrls={{}} disabled={disabled} onChange={onChange} />);

describe("PaSparetInput", () => {
  it("writes the guess, never with a brake of its own", async () => {
    const onChange = vi.fn();
    renderInput(null, false, onChange);
    await userEvent.type(screen.getByLabelText("Ert resmål"), "K");
    expect(onChange).toHaveBeenCalledWith({ type: "paSparet", guess: "K", brakeClueIndex: null });
  });

  it("shows a braked guess with the points it braked at", () => {
    renderInput({ type: "paSparet", guess: "Kiruna", brakeClueIndex: 2 }, true);
    expect(screen.getByLabelText("Ert resmål")).toBeDisabled();
    expect(screen.getByText("Bromsade vid 6 p")).toBeInTheDocument();
  });

  it("says when a locked guess never braked", () => {
    renderInput({ type: "paSparet", guess: "Kiruna", brakeClueIndex: null }, true);
    expect(screen.getByText("Ni bromsade inte.")).toBeInTheDocument();
  });
});
