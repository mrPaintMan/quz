import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LinesField } from "./LinesField";

describe("LinesField", () => {
  it("shows one value per line and reports the lines", async () => {
    const onChange = vi.fn();
    render(<LinesField label="Godkända svar" hint="Ett per rad" value={["kanel"]} onChange={onChange} />);
    expect(screen.getByText("Ett per rad")).toBeInTheDocument();
    const input = screen.getByLabelText("Godkända svar");
    expect(input).toHaveValue("kanel");
    await userEvent.type(input, "{enter}kanelstång");
    expect(onChange).toHaveBeenLastCalledWith(["kanel", "kanelstång"]);
  });
});
