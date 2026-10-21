import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddQuestionForm } from "./AddQuestionForm";

describe("AddQuestionForm", () => {
  it("adds a question of the picked type, the first type by default", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddQuestionForm label="Ny fråga av typen" buttonLabel="Lägg till fråga" types={["freeText", "number"]} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "Lägg till fråga" }));
    await userEvent.selectOptions(screen.getByLabelText("Ny fråga av typen"), "Gissa siffran");
    await userEvent.click(screen.getByRole("button", { name: "Lägg till fråga" }));
    expect(onAdd.mock.calls).toEqual([["freeText"], ["number"]]);
  });
});
