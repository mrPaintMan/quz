import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VerdictChoices } from "./VerdictChoices";

const unjudged = (written: string) => ({ written, isJudged: false, target: null });

describe("VerdictChoices", () => {
  it("gives a button per accepted answer of a short key, and Fel", async () => {
    const onChoose = vi.fn();
    render(<VerdictChoices slot={{ options: ["Vodka", "Kahlúa"], isOpen: false, names: [] }} item={unjudged("kahlua")} onChoose={onChoose} />);
    await userEvent.click(screen.getByRole("button", { name: "Kahlúa" }));
    expect(onChoose).toHaveBeenCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "Fel" }));
    expect(onChoose).toHaveBeenLastCalledWith(null);
  });

  it("picks from a list for a long key", async () => {
    const onChoose = vi.fn();
    const options = ["Glögg", "Apelsin", "Kanel", "Russin", "Mandel", "Nejlika"];
    render(<VerdictChoices slot={{ options, isOpen: false, names: [] }} item={{ written: "nejlikor", isJudged: true, target: 5 }} onChoose={onChoose} />);
    expect(screen.getByLabelText("Rätt som…")).toHaveValue("#5");
    await userEvent.selectOptions(screen.getByLabelText("Rätt som…"), "Kanel");
    expect(onChoose).toHaveBeenCalledWith(2);
  });

  it("in a list, counts a text as its own item, or as the same as a key item or an item already named", async () => {
    const onChoose = vi.fn();
    const slot = { options: ["Göteborg"], isOpen: true, names: ["Malmö", "Gothenburg"] };
    render(<VerdictChoices slot={slot} item={unjudged("Gothenburg")} onChoose={onChoose} />);
    await userEvent.click(screen.getByRole("button", { name: "Rätt" }));
    expect(onChoose).toHaveBeenCalledWith("Gothenburg");
    // Its own name isn't offered as another item.
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Samma som…", "Göteborg", "Malmö"]);
    await userEvent.selectOptions(screen.getByLabelText("Samma som…"), "Göteborg");
    expect(onChoose).toHaveBeenLastCalledWith(0);
    await userEvent.selectOptions(screen.getByLabelText("Samma som…"), "Malmö");
    expect(onChoose).toHaveBeenLastCalledWith("Malmö");
  });

  it("shows which way a list text was judged", () => {
    const slot = { options: [], isOpen: true, names: ["Malmö"] };
    const { rerender } = render(<VerdictChoices slot={slot} item={{ written: "malmö", isJudged: true, target: "Malmö" }} onChoose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Rätt" })).toHaveAttribute("aria-pressed", "true");
    rerender(<VerdictChoices slot={slot} item={{ written: "Malmoe", isJudged: true, target: "Malmö" }} onChoose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Rätt" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByLabelText("Samma som…")).toHaveValue("=Malmö");
    // A name given in another case is the same item.
    rerender(<VerdictChoices slot={slot} item={{ written: "Malmoe", isJudged: true, target: "malmö" }} onChoose={vi.fn()} />);
    expect(screen.getByLabelText("Samma som…")).toHaveValue("=Malmö");
  });

  it("has no list to pick from in an open slot with nothing to be the same as", () => {
    render(<VerdictChoices slot={{ options: [], isOpen: true, names: [] }} item={unjudged("Lund")} onChoose={vi.fn()} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
