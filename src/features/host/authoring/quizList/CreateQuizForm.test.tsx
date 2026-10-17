import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateQuizForm } from "./CreateQuizForm";

describe("CreateQuizForm", () => {
  it("suggests this year's Julquiz and creates it", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<CreateQuizForm defaultYear={2026} onCreate={onCreate} />);
    expect(screen.getByLabelText("Namn")).toHaveValue("Julquiz 2026");
    await userEvent.click(screen.getByRole("button", { name: "Skapa quiz" }));
    expect(onCreate).toHaveBeenCalledWith({ title: "Julquiz 2026", year: 2026 });
  });

  it("needs a name and a whole year", async () => {
    render(<CreateQuizForm defaultYear={2026} onCreate={vi.fn()} />);
    await userEvent.clear(screen.getByLabelText("Namn"));
    expect(screen.getByRole("button", { name: "Skapa quiz" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Namn"), "Påskquiz");
    await userEvent.clear(screen.getByLabelText("År"));
    await userEvent.type(screen.getByLabelText("År"), "20,5");
    expect(screen.getByRole("button", { name: "Skapa quiz" })).toBeDisabled();
  });
});
