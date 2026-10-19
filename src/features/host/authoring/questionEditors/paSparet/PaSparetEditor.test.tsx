import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ContentOf } from "@convex/questions/questionContent";
import { PaSparetEditor } from "./PaSparetEditor";

const content: ContentOf<"paSparet"> = {
  type: "paSparet",
  acceptedAnswers: ["Kiruna"],
  fuzzy: true,
  clues: ["Gruva", "Rymdbas", "", "", ""],
};

describe("PaSparetEditor", () => {
  it("shows five clues with their fixed points, with no way to add or remove one", () => {
    render(<PaSparetEditor content={content} onChange={vi.fn()} />);
    expect(screen.getAllByRole("textbox", { name: /^Ledtråd \d$/ })).toHaveLength(5);
    expect(screen.getByText("Ledtråd 1 · 10 p")).toBeInTheDocument();
    expect(screen.getByText("Ledtråd 5 · 2 p")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ledtråd/i })).not.toBeInTheDocument();
  });

  it("edits the destination, the clues and fuzzy matching", async () => {
    const onChange = vi.fn();
    render(<PaSparetEditor content={content} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Resmålet"), "{enter}Giron");
    expect(onChange.mock.lastCall?.[0].acceptedAnswers).toEqual(["Kiruna", "Giron"]);
    await userEvent.type(screen.getByLabelText("Ledtråd 2"), "!");
    expect(onChange.mock.lastCall?.[0].clues).toEqual(["Gruva", "Rymdbas!", "", "", ""]);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange.mock.lastCall?.[0].fuzzy).toBe(false);
  });

  it("brings a trip saved before D30 to five plain-text clues when a clue is edited", async () => {
    const onChange = vi.fn();
    render(<PaSparetEditor content={{ ...content, clues: [{ text: "Gruva", points: 10 }] }} onChange={onChange} />);
    expect(screen.getByLabelText("Ledtråd 1")).toHaveValue("Gruva");
    await userEvent.type(screen.getByLabelText("Ledtråd 3"), "N");
    expect(onChange.mock.lastCall?.[0].clues).toEqual(["Gruva", "", "N", "", ""]);
  });
});
