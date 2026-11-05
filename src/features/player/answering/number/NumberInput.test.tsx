import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "./NumberInput";

const shown = { type: "number" as const };

describe("NumberInput", () => {
  it("passes on the number typed, with a decimal comma", async () => {
    const onChange = vi.fn();
    render(<NumberInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Ert svar"), "3,5");
    expect(onChange).toHaveBeenLastCalledWith({ type: "number", value: 3.5 });
  });

  it("opens the phone's number pad", () => {
    render(<NumberInput shown={shown} answer={null} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Ert svar")).toHaveAttribute("inputmode", "decimal");
  });

  it("shows the answer saved so far", () => {
    render(<NumberInput shown={shown} answer={{ type: "number", value: 1200 }} imageUrls={{}} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Ert svar")).toHaveValue("1200");
  });

  it("can't change once locked", () => {
    render(<NumberInput shown={shown} answer={null} imageUrls={{}} disabled onChange={vi.fn()} />);
    expect(screen.getByLabelText("Ert svar")).toBeDisabled();
  });
});
