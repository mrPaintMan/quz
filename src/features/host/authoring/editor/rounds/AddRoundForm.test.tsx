import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddRoundForm } from "./AddRoundForm";

describe("AddRoundForm", () => {
  it("adds a question round with the typed name and clears the field", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddRoundForm onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText("Ny rond"), " Julmusik ");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till rond" }));
    expect(onAdd).toHaveBeenCalledWith({ title: "Julmusik", kind: "questions" });
    expect(screen.getByLabelText("Ny rond")).toHaveValue("");
  });

  it("names an untitled round after its kind", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddRoundForm onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till rond" }));
    expect(onAdd).toHaveBeenLastCalledWith({ title: "Ny rond", kind: "questions" });
    await userEvent.selectOptions(screen.getByLabelText("Sorts rond"), "På spåret");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till rond" }));
    expect(onAdd).toHaveBeenLastCalledWith({ title: "På spåret", kind: "paSparet" });
  });
});
