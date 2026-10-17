import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("shows its value and reports changes", async () => {
    const onChange = vi.fn();
    render(<TextField label="Etikett" value="a" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Etikett"), "b");
    expect(onChange).toHaveBeenLastCalledWith("ab");
  });
});
