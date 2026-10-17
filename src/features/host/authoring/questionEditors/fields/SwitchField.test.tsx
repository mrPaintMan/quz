import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SwitchField } from "./SwitchField";

describe("SwitchField", () => {
  it("shows its description and reports toggling", async () => {
    const onChange = vi.fn();
    render(<SwitchField label="Ungefärlig matchning" description="Nästan rätt räknas" checked={false} onChange={onChange} />);
    expect(screen.getByText("Nästan rätt räknas")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("switch", { name: "Ungefärlig matchning" }));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
