import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("shows the value with a decimal comma and reports typed numbers", async () => {
    const onChange = vi.fn();
    render(<NumberField label="Poäng" value={0.5} onChange={onChange} />);
    const input = screen.getByLabelText("Poäng");
    expect(input).toHaveValue("0,5");
    await userEvent.clear(input);
    await userEvent.type(input, "1,5");
    expect(onChange).toHaveBeenLastCalledWith(1.5);
  });

  it("reports an emptied field as NaN", async () => {
    const onChange = vi.fn();
    render(<NumberField label="Poäng" value={2} onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Poäng"));
    expect(onChange).toHaveBeenLastCalledWith(Number.NaN);
  });

  it("starts empty for a missing value", () => {
    render(<NumberField label="Svar" value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Svar")).toHaveValue("");
  });
});
